import type { Context } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import type { AppEnv, SessionUser } from "../types";
import { fromBase64Url, toBase64Url } from "./encoding";

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7일

const encoder = new TextEncoder();
const decoder = new TextDecoder();

type SessionPayload = SessionUser & { exp: number };

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(
  user: SessionUser,
  secret: string,
  maxAge = SESSION_MAX_AGE,
): Promise<string> {
  const payload: SessionPayload = { ...user, exp: Math.floor(Date.now() / 1000) + maxAge };
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await importKey(secret), encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function readSessionToken(
  token: string,
  secret: string,
): Promise<SessionUser | null> {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await importKey(secret),
      fromBase64Url(signature),
      encoder.encode(body),
    );
    if (!valid) return null;

    const payload = JSON.parse(decoder.decode(fromBase64Url(body))) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!payload.email || !payload.sub) return null;

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name || payload.email,
      picture: payload.picture,
    };
  } catch {
    return null;
  }
}

function cookieOptions(c: Context<AppEnv>) {
  return {
    httpOnly: true,
    sameSite: "Lax" as const,
    path: "/",
    secure: new URL(c.req.url).protocol === "https:",
  };
}

export function setSessionCookie(c: Context<AppEnv>, token: string): void {
  setCookie(c, SESSION_COOKIE, token, { ...cookieOptions(c), maxAge: SESSION_MAX_AGE });
}

export function clearSessionCookie(c: Context<AppEnv>): void {
  setCookie(c, SESSION_COOKIE, "", { ...cookieOptions(c), maxAge: 0 });
}

export async function currentUser(c: Context<AppEnv>): Promise<SessionUser | null> {
  const secret = c.env.SESSION_SECRET;
  if (!secret) return null;
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) return null;
  return readSessionToken(token, secret);
}
