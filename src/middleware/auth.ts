import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../types";
import { isAdminEmail, isEmailAllowed } from "../lib/access";
import { clearSessionCookie, currentUser } from "../lib/session";

function deny(c: Context<AppEnv>, notAllowed = false) {
  if (c.req.header("HX-Request") === "true") {
    c.header("HX-Redirect", "/login");
    return c.body(null, 401);
  }
  return c.redirect(notAllowed ? "/login?error=not_allowed" : "/login");
}

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  c.header("Cache-Control", "no-store");
  const user = await currentUser(c);

  if (!user) return deny(c);

  // 허용 목록에서 제거된 사용자의 세션은 다음 요청부터 무효화합니다.
  // D1 일시 오류로 모든 사용자를 로그아웃시키지 않도록, 확인에 실패하면 세션을 신뢰합니다.
  let allowed = true;
  try {
    allowed = await isEmailAllowed(c.env.DB, user.email, c.env.ALLOWED_EMAILS);
  } catch (error) {
    console.error("allow list check failed", error);
  }

  if (!allowed) {
    clearSessionCookie(c);
    return deny(c, true);
  }

  c.set("user", user);
  c.set("isAdmin", isAdminEmail(user.email, c.env.ALLOWED_EMAILS));
  await next();
});
