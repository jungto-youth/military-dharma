import { Hono } from "hono";
import type { AppEnv } from "../types";
import { ApplyPage } from "../components/apply-form";
import { ApplyCompletePage } from "../components/apply-complete";
import { LandingView } from "../components/landing";
import { PublicLayout } from "../components/public-layout";
import {
  emptyApplicationValues,
  createApplication,
  getApplicationByToken,
  parseApplicationForm,
  validateApplication,
} from "../lib/applications";
import {
  availabilityOf,
  groupShiftDays,
  listEventsWithCounts,
  splitEvents,
} from "../lib/baraji";

export const publicRoutes = new Hono<AppEnv>();

publicRoutes.get("/", async (c) => {
  const events = await listEventsWithCounts(c.env.DB);
  c.header("Cache-Control", "no-store");
  return c.html(<LandingView events={events} />);
});

publicRoutes.get("/apply", async (c) => {
  const events = await listEventsWithCounts(c.env.DB);
  const { stay, shift } = splitEvents(events);
  const days = groupShiftDays(shift);

  const rawType = c.req.query("type");
  const rawEvent = c.req.query("event");
  const eventId = rawEvent && /^\d+$/.test(rawEvent) ? Number(rawEvent) : 0;
  const candidate = events.find((event) => event.id === eventId);
  const preselected =
    candidate && availabilityOf(candidate).state === "open" ? candidate : undefined;

  const type =
    preselected?.kind ?? (rawType === "shift" ? "shift" : "stay");
  const values = emptyApplicationValues(type);

  c.header("Cache-Control", "no-store");
  return c.html(
    <ApplyPage
      stay={stay}
      shift={shift}
      days={days}
      values={values}
      selectedEventIds={preselected ? [preselected.id] : []}
      errors={{}}
    />,
  );
});

publicRoutes.post("/apply", async (c) => {
  const body = await c.req.parseBody({ all: true });
  const parsed = parseApplicationForm(body);
  const { errors, events } = await validateApplication(
    c.env.DB,
    parsed.values,
    parsed.eventIds,
  );

  if (Object.keys(errors).length > 0) {
    const allEvents = await listEventsWithCounts(c.env.DB);
    const { stay, shift } = splitEvents(allEvents);
    c.header("Cache-Control", "no-store");
    return c.html(
      <ApplyPage
        stay={stay}
        shift={shift}
        days={groupShiftDays(shift)}
        values={parsed.values}
        selectedEventIds={parsed.eventIds}
        errors={errors}
      />,
    );
  }

  const application = await createApplication(c.env.DB, parsed.values, events);
  return c.redirect(`/apply/complete/${application.accessToken}`, 303);
});

publicRoutes.get("/apply/complete/:token", async (c) => {
  const token = c.req.param("token");
  const application = await getApplicationByToken(c.env.DB, token);

  c.header("Cache-Control", "no-store");
  c.header("X-Robots-Tag", "noindex");

  if (!application) {
    return c.html(
      <PublicLayout
        title="신청 내역을 찾을 수 없습니다"
        description="신청 완료 링크가 만료되었거나 올바르지 않습니다."
        noindex
      >
        <div class="mx-auto w-full max-w-2xl px-5 py-20 sm:px-8">
          <div class="border-t-2 border-ink pt-6">
            <p class="font-mono text-[11px] text-muted">404</p>
            <h1 class="mt-2 font-serif text-[28px] font-bold tracking-[-0.02em] text-ink">
              신청 내역을 찾을 수 없습니다
            </h1>
            <p class="mt-3 text-[13px] leading-6 text-ink-soft">
              링크가 만료되었거나 주소가 올바르지 않습니다. 다시 신청하거나 운영
              담당자에게 문의해주세요.
            </p>
            <a href="/apply" class="btn btn-primary mt-6">
              신청서로 이동
            </a>
          </div>
        </div>
      </PublicLayout>,
      404,
    );
  }

  return c.html(<ApplyCompletePage application={application} />);
});
