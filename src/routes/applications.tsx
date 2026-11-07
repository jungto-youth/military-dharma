import type { Context } from "hono";
import { Hono } from "hono";
import type { AppEnv } from "../types";
import { Layout } from "../components/layout";
import {
  ApplicationDetail,
  ApplicationTable,
  ApplicationsView,
} from "../components/applications-view";
import { requireAuth } from "../middleware/auth";
import {
  APPLICATION_STATUS_META,
  APPLICATION_TYPE_META,
  GENDERS,
  MEMBERSHIPS,
  applicationEventDetail,
  buildCsv,
  countApplications,
  getApplicationById,
  isApplicationStatus,
  isApplicationType,
  listApplications,
  updateApplicationStatus,
  type ApplicationFilters,
} from "../lib/applications";
import { formatTimestampKst, listEventsWithCounts } from "../lib/baraji";

export const applicationsRoutes = new Hono<AppEnv>();

applicationsRoutes.use("*", requireAuth);

function isHtmx(c: Context<AppEnv>): boolean {
  return c.req.header("HX-Request") === "true";
}

function readFilters(c: Context<AppEnv>): ApplicationFilters {
  const q = (c.req.query("q") ?? "").trim().slice(0, 80);
  const rawStatus = c.req.query("status") ?? "";
  const rawType = c.req.query("type") ?? "";
  const rawEvent = c.req.query("event") ?? "";
  const eventId = /^\d+$/.test(rawEvent) ? Number(rawEvent) : 0;

  return {
    q: q || undefined,
    status: isApplicationStatus(rawStatus) ? rawStatus : undefined,
    type: isApplicationType(rawType) ? rawType : undefined,
    eventId: eventId > 0 ? eventId : undefined,
  };
}

async function renderPage(
  c: Context<AppEnv>,
  state: { message?: string } = {},
) {
  const filters = readFilters(c);
  const [rows, total, events] = await Promise.all([
    listApplications(c.env.DB, filters),
    countApplications(c.env.DB, filters),
    listEventsWithCounts(c.env.DB),
  ]);

  return c.html(
    <Layout
      title="신청 접수"
      user={c.get("user")}
      isAdmin={c.get("isAdmin")}
      active="applications"
    >
      <ApplicationsView
        rows={rows}
        total={total}
        events={events}
        filters={{
          q: filters.q ?? "",
          status: filters.status,
          type: filters.type,
          eventId: filters.eventId,
        }}
        message={state.message}
      />
    </Layout>,
  );
}

applicationsRoutes.get("/", async (c) => {
  return renderPage(c, {
    message: c.req.query("saved") ? "신청 상태를 저장했습니다." : undefined,
  });
});

applicationsRoutes.get("/table", async (c) => {
  const filters = readFilters(c);
  const [rows, total, events] = await Promise.all([
    listApplications(c.env.DB, filters),
    countApplications(c.env.DB, filters),
    listEventsWithCounts(c.env.DB),
  ]);

  return c.html(
    <ApplicationTable
      rows={rows}
      total={total}
      events={events}
      filters={{
        q: filters.q ?? "",
        status: filters.status,
        type: filters.type,
        eventId: filters.eventId,
      }}
    />,
  );
});

applicationsRoutes.get("/export.csv", async (c) => {
  const filters = readFilters(c);
  const rows = await listApplications(c.env.DB, filters);

  const headers = [
    "접수번호",
    "상태",
    "참여방식",
    "일정",
    "이름",
    "연락처",
    "소속",
    "회원구분",
    "성별",
    "숙박",
    "텔레그램",
    "신청동기",
    "접수일",
    "명부연결",
  ];

  const csv = buildCsv(
    headers,
    rows.map((row) => ({
      접수번호: row.reference,
      상태: APPLICATION_STATUS_META[row.status].label,
      참여방식: APPLICATION_TYPE_META[row.type],
      일정: applicationEventDetail(row.events),
      이름: row.name,
      연락처: row.phone,
      소속: row.affiliation,
      회원구분:
        row.membership === "other"
          ? `기타 · ${row.membershipOther}`
          : MEMBERSHIPS[row.membership],
      성별: GENDERS[row.gender],
      숙박:
        row.type === "stay"
          ? row.lodging === "yes"
            ? "숙박"
            : "통근"
          : "일일",
      텔레그램: row.telegram,
      신청동기: row.motivation.replace(/\r?\n/g, " "),
      접수일: formatTimestampKst(row.createdAt),
      명부연결: row.volunteerId ? `#${row.volunteerId}` : "",
    })),
  );

  c.header("Content-Type", "text/csv; charset=utf-8");
  c.header(
    "Content-Disposition",
    'attachment; filename="baraji-applications-2026-11.csv"',
  );
  return c.body(csv);
});

applicationsRoutes.get("/:id", async (c) => {
  const rawId = c.req.param("id");
  const id = /^\d+$/.test(rawId) ? Number(rawId) : 0;
  if (!id) return c.notFound();

  const application = await getApplicationById(c.env.DB, id);
  if (!application) return c.notFound();

  if (!isHtmx(c)) {
    return c.redirect(
      `/admin/applications?q=${encodeURIComponent(application.reference)}`,
    );
  }

  return c.html(<ApplicationDetail application={application} />);
});

applicationsRoutes.post("/:id/status", async (c) => {
  const rawId = c.req.param("id");
  const id = /^\d+$/.test(rawId) ? Number(rawId) : 0;
  if (!id) return c.notFound();

  const body = await c.req.parseBody();
  const status = typeof body.status === "string" ? body.status : "";
  if (!isApplicationStatus(status)) return c.notFound();

  const updated = await updateApplicationStatus(c.env.DB, id, status);
  if (!updated) return c.notFound();

  const message =
    status === "confirmed"
      ? `${updated.name} 신청을 확정하고 명부에 등록했습니다.`
      : `${updated.name} 신청 상태를 ${APPLICATION_STATUS_META[status].label}(으)로 바꿨습니다.`;

  if (!isHtmx(c)) return c.redirect("/admin/applications?saved=1");

  c.header(
    "HX-Trigger",
    JSON.stringify({ "application:changed": { message } }).replace(
      /[\u0080-\uffff]/g,
      (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`,
    ),
  );

  return c.html(<ApplicationDetail application={updated} />);
});
