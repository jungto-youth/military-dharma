import type { Context } from "hono";
import { Hono } from "hono";
import type { AppEnv } from "../types";
import {
  AllowedEmailsPanel,
  AllowedEmailsView,
  type AllowedEmailsState,
} from "../components/allowed-emails-view";
import { Layout } from "../components/layout";
import { NoticePage } from "../components/notice";
import { requireAuth } from "../middleware/auth";
import {
  addAllowedEmail,
  isValidEmail,
  listAllowedEmails,
  matchesEnvAllowList,
  normalizeEmail,
  parseAllowedEmailId,
  removeAllowedEmail,
} from "../lib/access";

export const adminRoutes = new Hono<AppEnv>();

adminRoutes.use("*", requireAuth);

// ALLOWED_EMAILS에 포함된 관리자만 접근할 수 있습니다.
adminRoutes.use("*", async (c, next) => {
  if (c.get("isAdmin")) {
    await next();
    return;
  }

  if (isHtmx(c)) {
    c.header("HX-Redirect", "/admin");
    return c.body(null, 403);
  }

  return c.html(
    <NoticePage
      code="403"
      title="접근 권한이 없습니다"
      description="허용 이메일 관리는 관리자만 사용할 수 있습니다. 운영 담당자에게 권한을 요청하세요."
      brand="admin"
    />,
    403,
  );
});

function isHtmx(c: Context<AppEnv>): boolean {
  return c.req.header("HX-Request") === "true";
}

function readText(value: string | File | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

async function render(c: Context<AppEnv>, state: AllowedEmailsState = {}) {
  const rows = await listAllowedEmails(c.env.DB);
  const selfEmail = c.get("user").email;

  if (isHtmx(c)) {
    return c.html(<AllowedEmailsPanel rows={rows} selfEmail={selfEmail} {...state} />);
  }

  return c.html(
    <Layout
      title="허용 이메일"
      user={c.get("user")}
      isAdmin={c.get("isAdmin")}
      active="emails"
    >
      <AllowedEmailsView rows={rows} selfEmail={selfEmail} {...state} />
    </Layout>,
  );
}

adminRoutes.get("/", (c) => {
  const message = c.req.query("added")
    ? "예외 이메일을 등록했습니다."
    : c.req.query("deleted")
      ? "예외 이메일을 삭제했습니다."
      : undefined;

  return render(c, { message });
});

adminRoutes.post("/", async (c) => {
  const body = await c.req.parseBody();
  const email = normalizeEmail(readText(body.email));
  const memo = readText(body.memo).slice(0, 100);
  const values = { email, memo };
  const user = c.get("user");

  if (!email) {
    return render(c, { error: "이메일을 입력하세요.", values });
  }

  if (!isValidEmail(email)) {
    return render(c, { error: "이메일 형식을 확인하세요.", values });
  }

  if (matchesEnvAllowList(email, c.env.ALLOWED_EMAILS)) {
    return render(c, {
      error: "이미 관리자 허용 목록에 있는 이메일입니다.",
      values,
    });
  }

  if (email === normalizeEmail(user.email)) {
    return render(c, {
      error: "현재 로그인한 관리자 이메일은 등록할 필요가 없습니다.",
      values,
    });
  }

  const result = await addAllowedEmail(c.env.DB, {
    email,
    memo,
    createdBy: user.email,
  });

  if (result === "duplicate") {
    return render(c, { error: "이미 등록된 이메일입니다.", values });
  }

  if (!isHtmx(c)) return c.redirect("/admin/emails?added=1");

  return render(c, {
    message: `${email}을(를) 예외 목록에 등록했습니다.`,
  });
});

adminRoutes.delete("/:id", async (c) => {
  const id = parseAllowedEmailId(c.req.param("id"));
  if (!id) return c.notFound();

  const removed = await removeAllowedEmail(c.env.DB, id);
  if (!removed) return c.notFound();

  if (!isHtmx(c)) return c.redirect("/admin/emails?deleted=1");

  return render(c, { message: "예외 이메일을 삭제했습니다." });
});
