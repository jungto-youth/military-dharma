import { desc, eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { allowedEmails, type AllowedEmail } from "../db/schema";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// `*` 전체 허용, `user@example.com` 개별 허용, `@example.com` 도메인 전체 허용.
export function matchesEnvAllowList(
  email: string,
  allowList: string | undefined,
): boolean {
  const allowed = (allowList ?? "")
    .split(/[\s,]+/)
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  const normalized = normalizeEmail(email);

  return allowed.some(
    (entry) =>
      entry === "*" ||
      entry === normalized ||
      (entry.startsWith("@") && normalized.endsWith(entry)),
  );
}

// ALLOWED_EMAILS에 포함된 사용자를 관리자로 봅니다.
export function isAdminEmail(
  email: string,
  allowList: string | undefined,
): boolean {
  return matchesEnvAllowList(email, allowList);
}

// 환경 변수 허용 목록 또는 DB 예외 목록에 있으면 로그인을 허용합니다.
export async function isEmailAllowed(
  d1: D1Database,
  email: string,
  allowList: string | undefined,
): Promise<boolean> {
  if (matchesEnvAllowList(email, allowList)) return true;

  const normalized = normalizeEmail(email);
  if (!normalized) return false;

  const rows = await getDb(d1)
    .select({ id: allowedEmails.id })
    .from(allowedEmails)
    .where(eq(allowedEmails.email, normalized))
    .limit(1);

  return rows.length > 0;
}

export function isValidEmail(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function listAllowedEmails(
  d1: D1Database,
): Promise<AllowedEmail[]> {
  return getDb(d1)
    .select()
    .from(allowedEmails)
    .orderBy(desc(allowedEmails.id));
}

export type AddAllowedEmailResult = "added" | "duplicate";

export async function addAllowedEmail(
  d1: D1Database,
  input: { email: string; memo: string; createdBy: string },
): Promise<AddAllowedEmailResult> {
  const db = getDb(d1);
  const existing = await db
    .select({ id: allowedEmails.id })
    .from(allowedEmails)
    .where(eq(allowedEmails.email, input.email))
    .limit(1);

  if (existing.length > 0) return "duplicate";

  await db.insert(allowedEmails).values(input);
  return "added";
}

export async function removeAllowedEmail(
  d1: D1Database,
  id: number,
): Promise<boolean> {
  const db = getDb(d1);
  const rows = await db
    .select({ id: allowedEmails.id })
    .from(allowedEmails)
    .where(eq(allowedEmails.id, id))
    .limit(1);

  if (rows.length === 0) return false;

  await db.delete(allowedEmails).where(eq(allowedEmails.id, id));
  return true;
}

export function parseAllowedEmailId(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

// SQLite CURRENT_TIMESTAMP(UTC, "YYYY-MM-DD HH:MM:SS")를 한국 시간 날짜로 표시합니다.
export function formatTimestamp(value: string): string {
  if (!value) return "—";
  const iso = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
