import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { AppEnv } from "../types";
import { LoginPage } from "../components/login";
import { isEmailAllowed } from "../lib/access";
import { randomString, toBase64Url } from "../lib/encoding";
import {
  clearSessionCookie,
  createSessionToken,
  currentUser,
  setSessionCookie,
} from "../lib/session";

export const authRoutes = new Hono<AppEnv>();

const OAUTH_COOKIE = "oauth_flow";
const OAUTH_TTL = 60 * 10;
const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_ENDPOINT = "https://openidconnect.googleapis.com/v1/userinfo";

type OAuthFlow = { state: string; verifier: string };

type GoogleTokenResponse = { access_token?: string };

type GoogleProfile = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

function isConfigured(env: AppEnv["Bindings"]): boolean {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.SESSION_SECRET);
}

function devLoginEnabled(env: AppEnv["Bindings"]): boolean {
  return env.ALLOW_DEV_LOGIN === "true";
}

function callbackUrl(url: string): string {
  return new URL("/auth/google/callback", url).toString();
}

function errorMessage(code?: string): string | undefined {
  switch (code) {
    case "not_allowed":
      return "이 Google 계정은 접근 허용 목록에 없습니다. 운영 담당자에게 등록을 요청하세요.";    case "state":
      return "로그인 요청이 만료되었거나 올바르지 않습니다. 다시 시도하세요.";
    case "cancelled":
      return "로그인이 취소되었습니다.";
    case "config":
      return "로그인 설정이 완료되지 않았습니다. 관리자에게 문의하세요.";
    case "oauth":
      return "Google 인증에 실패했습니다. 잠시 후 다시 시도하세요.";
    default:
      return undefined;
  }
}

authRoutes.get("/login", async (c) => {
  c.header("Cache-Control", "no-store");
  const code = c.req.query("error");
  if (!code) {
    const user = await currentUser(c);
    if (user) return c.redirect("/");
  }

  return c.html(
    <LoginPage
      configured={isConfigured(c.env)}
      devLogin={devLoginEnabled(c.env)}
      error={errorMessage(code)}
    />,
  );
});

authRoutes.get("/auth/google", async (c) => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET } = c.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !SESSION_SECRET) {
    return c.redirect("/login?error=config");
  }

  const state = randomString(24);
  const verifier = randomString(48);
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier),
  );
  const challenge = toBase64Url(new Uint8Array(digest));

  const flow: OAuthFlow = { state, verifier };
  setCookie(c, OAUTH_COOKIE, JSON.stringify(flow), {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    secure: new URL(c.req.url).protocol === "https:",
    maxAge: OAUTH_TTL,
  });

  const authorize = new URL(GOOGLE_AUTH_ENDPOINT);
  authorize.searchParams.set("client_id", GOOGLE_CLIENT_ID);
  authorize.searchParams.set("redirect_uri", callbackUrl(c.req.url));
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("scope", "openid email profile");
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("code_challenge", challenge);
  authorize.searchParams.set("code_challenge_method", "S256");
  authorize.searchParams.set("prompt", "select_account");

  return c.redirect(authorize.toString());
});

authRoutes.get("/auth/google/callback", async (c) => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET } = c.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !SESSION_SECRET) {
    return c.redirect("/login?error=config");
  }

  const oauthError = c.req.query("error");
  if (oauthError === "access_denied") {
    return c.redirect("/login?error=cancelled");
  }
  if (oauthError) {
    return c.redirect("/login?error=oauth");
  }

  const code = c.req.query("code");
  const state = c.req.query("state");
  const rawFlow = getCookie(c, OAUTH_COOKIE);
  deleteCookie(c, OAUTH_COOKIE, { path: "/" });

  if (!code || !state || !rawFlow) {
    return c.redirect("/login?error=state");
  }

  let flow: OAuthFlow;
  try {
    flow = JSON.parse(rawFlow) as OAuthFlow;
  } catch {
    return c.redirect("/login?error=state");
  }

  if (!flow.state || flow.state !== state || !flow.verifier) {
    return c.redirect("/login?error=state");
  }

  const tokenResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: callbackUrl(c.req.url),
      code_verifier: flow.verifier,
    }),
  });

  if (!tokenResponse.ok) {
    return c.redirect("/login?error=oauth");
  }

  const token = (await tokenResponse.json()) as GoogleTokenResponse;
  if (!token.access_token) {
    return c.redirect("/login?error=oauth");
  }

  const profileResponse = await fetch(GOOGLE_USERINFO_ENDPOINT, {
    headers: { authorization: `Bearer ${token.access_token}` },
  });

  if (!profileResponse.ok) {
    return c.redirect("/login?error=oauth");
  }

  const profile = (await profileResponse.json()) as GoogleProfile;
  const email = profile.email?.trim().toLowerCase();

  if (!profile.sub || !email || profile.email_verified === false) {
    return c.redirect("/login?error=oauth");
  }

  let allowed = false;
  try {
    allowed = await isEmailAllowed(c.env.DB, email, c.env.ALLOWED_EMAILS);
  } catch (error) {
    console.error("allow list check failed", error);
    return c.redirect("/login?error=oauth");
  }

  if (!allowed) {
    return c.redirect("/login?error=not_allowed");
  }

  const session = await createSessionToken(
    {
      sub: profile.sub,
      email,
      name: profile.name?.trim() || email,
      picture: profile.picture,
    },
    SESSION_SECRET,
  );

  setSessionCookie(c, session);
  return c.redirect("/");
});

authRoutes.get("/auth/dev", async (c) => {
  if (!devLoginEnabled(c.env)) return c.notFound();
  if (!c.env.SESSION_SECRET) return c.redirect("/login?error=config");

  const email = (c.req.query("email") ?? "dev@example.com").trim().toLowerCase();
  const name = (c.req.query("name") ?? "개발자").trim() || "개발자";

  const token = await createSessionToken({ sub: "dev", email, name }, c.env.SESSION_SECRET);
  setSessionCookie(c, token);
  return c.redirect("/");
});

authRoutes.post("/auth/logout", (c) => {
  clearSessionCookie(c);
  return c.redirect("/login");
});
