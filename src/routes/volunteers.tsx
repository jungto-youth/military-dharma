import type { Context } from "hono";
import { Hono } from "hono";
import type { AppEnv } from "../types";
import { Layout, PageHeader } from "../components/layout";
import { VolunteerForm } from "../components/volunteer-form";
import { VolunteerTable } from "../components/volunteer-table";
import { VolunteersView } from "../components/volunteers-view";
import { requireAuth } from "../middleware/auth";
import {
  countVolunteers,
  createVolunteer,
  deleteVolunteer,
  emptyValues,
  getVolunteer,
  isStatus,
  listVolunteers,
  parseVolunteerForm,
  parseVolunteerId,
  toFormValues,
  updateVolunteer,
  type FieldErrors,
  type VolunteerFormValues,
} from "../lib/volunteers";

export const volunteersRoutes = new Hono<AppEnv>();

volunteersRoutes.use("*", requireAuth);

type FormContext = "dialog" | "page";

function isHtmx(c: Context<AppEnv>): boolean {
  return c.req.header("HX-Request") === "true";
}

function readFilters(c: Context<AppEnv>) {
  const q = (c.req.query("q") ?? "").trim().slice(0, 80);
  const rawStatus = c.req.query("status") ?? "";
  return { q, status: isStatus(rawStatus) ? rawStatus : undefined };
}

function resolveContext(c: Context<AppEnv>, rawContext: unknown): FormContext {
  if (rawContext === "dialog" || rawContext === "page") return rawContext;
  return isHtmx(c) ? "dialog" : "page";
}

function formPage(
  c: Context<AppEnv>,
  title: string,
  description: string,
  form: ReturnType<typeof VolunteerForm>,
) {
  return c.html(
    <Layout
      title={title}
      user={c.get("user")}
      isAdmin={c.get("isAdmin")}
      active="volunteers"
    >
      <div class="pt-6">
        <PageHeader title={title} description={description} />
        <div id="form-slot" class="mt-6 max-w-3xl border border-line bg-paper-soft p-5 sm:p-7">
          {form}
        </div>
      </div>
    </Layout>,
  );
}

function renderFormError(
  c: Context<AppEnv>,
  options: {
    values: VolunteerFormValues;
    errors: FieldErrors;
    volunteerId?: number;
    context: FormContext;
  },
) {
  const isEdit = typeof options.volunteerId === "number";
  const title = isEdit ? "봉사자 정보 수정" : "봉사자 등록";
  const description = isEdit
    ? "봉사자 정보를 수정합니다."
    : "명부에 새 봉사자를 추가합니다.";

  const form = (
    <VolunteerForm
      values={options.values}
      errors={options.errors}
      volunteerId={options.volunteerId}
      context={options.context}
    />
  );

  if (isHtmx(c)) return c.html(form);
  return formPage(c, title, description, form);
}

function notifyChange(c: Context<AppEnv>, message: string) {
  c.header(
    "HX-Trigger",
    asciiJson({ "volunteer:changed": { message } }),
  );
  return c.body(null, 204);
}

// HTTP 헤더는 ASCII만 안전합니다. 한글 메시지는 \uXXXX 로 이스케이프합니다.
function asciiJson(value: unknown): string {
  return JSON.stringify(value).replace(/[\u0080-\uffff]/g, (char) => {
    return `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`;
  });
}

volunteersRoutes.get("/", async (c) => {
  const filters = readFilters(c);
  const [rows, total] = await Promise.all([
    listVolunteers(c.env.DB, filters),
    countVolunteers(c.env.DB, filters),
  ]);

  return c.html(
    <Layout
      title="봉사자 명부"
      user={c.get("user")}
      isAdmin={c.get("isAdmin")}
      active="volunteers"
    >
      <VolunteersView rows={rows} total={total} q={filters.q} status={filters.status} />
    </Layout>,
  );
});

volunteersRoutes.get("/table", async (c) => {
  const filters = readFilters(c);
  const [rows, total] = await Promise.all([
    listVolunteers(c.env.DB, filters),
    countVolunteers(c.env.DB, filters),
  ]);

  return c.html(
    <VolunteerTable rows={rows} total={total} q={filters.q} status={filters.status} />,
  );
});

volunteersRoutes.get("/new", (c) => {
  const form = <VolunteerForm values={emptyValues()} context={isHtmx(c) ? "dialog" : "page"} />;
  if (isHtmx(c)) return c.html(form);
  return formPage(c, "봉사자 등록", "명부에 새 봉사자를 추가합니다.", form);
});

volunteersRoutes.post("/", async (c) => {
  const body = await c.req.parseBody();
  const context = resolveContext(c, body._context);
  const result = parseVolunteerForm(body);

  if (!result.ok) {
    return renderFormError(c, {
      values: result.values,
      errors: result.errors,
      context,
    });
  }

  await createVolunteer(c.env.DB, result.values);

  if (!isHtmx(c)) return c.redirect("/admin/volunteers");
  return notifyChange(c, "봉사자를 등록했습니다.");
});

volunteersRoutes.get("/:id/edit", async (c) => {
  const id = parseVolunteerId(c.req.param("id"));
  if (!id) return c.notFound();

  const volunteer = await getVolunteer(c.env.DB, id);
  if (!volunteer) return c.notFound();

  const form = (
    <VolunteerForm
      values={toFormValues(volunteer)}
      volunteerId={volunteer.id}
      context={isHtmx(c) ? "dialog" : "page"}
    />
  );

  if (isHtmx(c)) return c.html(form);
  return formPage(c, "봉사자 정보 수정", "봉사자 정보를 수정합니다.", form);
});

async function updateHandler(c: Context<AppEnv>) {
  const id = parseVolunteerId(c.req.param("id") ?? "");
  if (!id) return c.notFound();

  const volunteer = await getVolunteer(c.env.DB, id);
  if (!volunteer) return c.notFound();

  const body = await c.req.parseBody();
  const context = resolveContext(c, body._context);
  const result = parseVolunteerForm(body);

  if (!result.ok) {
    return renderFormError(c, {
      values: result.values,
      errors: result.errors,
      volunteerId: id,
      context,
    });
  }

  await updateVolunteer(c.env.DB, id, result.values);

  if (!isHtmx(c)) return c.redirect("/admin/volunteers");
  return notifyChange(c, "봉사자 정보를 저장했습니다.");
}

volunteersRoutes.put("/:id", updateHandler);
volunteersRoutes.post("/:id", updateHandler);

volunteersRoutes.delete("/:id", async (c) => {
  const id = parseVolunteerId(c.req.param("id"));
  if (!id) return c.notFound();

  const volunteer = await getVolunteer(c.env.DB, id);
  if (!volunteer) return c.notFound();

  await deleteVolunteer(c.env.DB, id);

  if (!isHtmx(c)) return c.redirect("/admin/volunteers");
  return notifyChange(c, "봉사자를 명부에서 삭제했습니다.");
});
