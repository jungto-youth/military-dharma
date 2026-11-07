import type { Context } from "hono";
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import type { AppEnv } from "../types";
import { Layout } from "../components/layout";
import { SchedulesPanel, SchedulesView } from "../components/schedules-view";
import { requireAuth } from "../middleware/auth";
import { getDb } from "../db/client";
import { barajiEvents } from "../db/schema";
import { listEventsWithCounts, splitEvents } from "../lib/baraji";

export const schedulesRoutes = new Hono<AppEnv>();

schedulesRoutes.use("*", requireAuth);

function isHtmx(c: Context<AppEnv>): boolean {
  return c.req.header("HX-Request") === "true";
}

async function panel(c: Context<AppEnv>, state: { message?: string; error?: string }) {
  const events = await listEventsWithCounts(c.env.DB);
  const { stay, shift } = splitEvents(events);
  return <SchedulesPanel stay={stay} shift={shift} {...state} />;
}

async function page(c: Context<AppEnv>, state: { message?: string; error?: string }) {
  const events = await listEventsWithCounts(c.env.DB);
  const { stay, shift } = splitEvents(events);

  return c.html(
    <Layout
      title="일정·정원"
      user={c.get("user")}
      isAdmin={c.get("isAdmin")}
      active="schedules"
    >
      <SchedulesView stay={stay} shift={shift} {...state} />
    </Layout>,
  );
}

schedulesRoutes.get("/", async (c) => {
  return page(c, {
    message: c.req.query("saved") ? "일정 설정을 저장했습니다." : undefined,
  });
});

schedulesRoutes.post("/:id", async (c) => {
  const rawId = c.req.param("id");
  const id = /^\d+$/.test(rawId) ? Number(rawId) : 0;
  if (!id) return c.notFound();

  const db = getDb(c.env.DB);
  const existing = await db
    .select()
    .from(barajiEvents)
    .where(eq(barajiEvents.id, id))
    .limit(1);

  if (!existing[0]) return c.notFound();

  const body = await c.req.parseBody();
  const unlimited = body.unlimited === "on";
  const rawCapacity = typeof body.capacity === "string" ? body.capacity.trim() : "";

  let capacity: number | null = null;

  if (!unlimited) {
    if (!rawCapacity) {
      if (isHtmx(c)) {
        return c.html(await panel(c, { error: "정원을 입력하거나 제한 없음을 선택하세요." }));
      }
      return page(c, { error: "정원을 입력하거나 제한 없음을 선택하세요." });
    }

    if (!/^\d+$/.test(rawCapacity)) {
      if (isHtmx(c)) {
        return c.html(await panel(c, { error: "정원은 0 이상의 정수로 입력하세요." }));
      }
      return page(c, { error: "정원은 0 이상의 정수로 입력하세요." });
    }

    capacity = Number(rawCapacity);
  }

  await db
    .update(barajiEvents)
    .set({
      capacity,
      isOpen: body.isOpen === "on",
      updatedAt: new Date().toISOString(),
    })
    .where(eq(barajiEvents.id, id));

  if (!isHtmx(c)) return c.redirect("/admin/schedules?saved=1");

  return c.html(await panel(c, { message: "일정 설정을 저장했습니다." }));
});
