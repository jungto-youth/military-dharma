import { and, asc, count, desc, eq, like, or, sql } from "drizzle-orm";
import { getDb } from "../db/client";
import { volunteers, type Volunteer, type VolunteerStatus } from "../db/schema";
import { isStatus } from "./status";

export { STATUSES, STATUS_META, isStatus } from "./status";

export type VolunteerFormValues = {
  name: string;
  affiliation: string;
  rank: string;
  specialty: string;
  region: string;
  phone: string;
  email: string;
  status: VolunteerStatus;
  joinedAt: string;
  notes: string;
};

export type FieldErrors = Partial<Record<keyof VolunteerFormValues, string>>;

export type ParseResult = {
  ok: boolean;
  values: VolunteerFormValues;
  errors: FieldErrors;
};

export function emptyValues(): VolunteerFormValues {
  return {
    name: "",
    affiliation: "",
    rank: "",
    specialty: "",
    region: "",
    phone: "",
    email: "",
    status: "active",
    joinedAt: today(),
    notes: "",
  };
}

export function toFormValues(volunteer: Volunteer): VolunteerFormValues {
  return {
    name: volunteer.name,
    affiliation: volunteer.affiliation,
    rank: volunteer.rank,
    specialty: volunteer.specialty,
    region: volunteer.region,
    phone: volunteer.phone,
    email: volunteer.email,
    status: volunteer.status,
    joinedAt: volunteer.joinedAt,
    notes: volunteer.notes,
  };
}

export function parseVolunteerForm(
  body: Record<string, string | File>,
): ParseResult {
  const read = (key: string): string => {
    const value = body[key];
    return typeof value === "string" ? value.trim() : "";
  };

  const rawStatus = read("status");
  const values: VolunteerFormValues = {
    name: read("name"),
    affiliation: read("affiliation"),
    rank: read("rank"),
    specialty: read("specialty"),
    region: read("region"),
    phone: read("phone"),
    email: read("email"),
    status: isStatus(rawStatus) ? rawStatus : "standby",
    joinedAt: read("joinedAt"),
    notes: read("notes"),
  };

  const errors: FieldErrors = {};

  if (!values.name) {
    errors.name = "이름을 입력하세요.";
  } else if (values.name.length > 60) {
    errors.name = "이름은 60자 이내로 입력하세요.";
  }

  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "이메일 형식을 확인하세요.";
  }

  if (values.phone && !/^[0-9+\-()\s]{4,30}$/.test(values.phone)) {
    errors.phone = "연락처는 숫자와 -, +, 괄호만 사용할 수 있습니다.";
  }

  if (values.joinedAt) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.joinedAt)) {
      errors.joinedAt = "가입일을 YYYY-MM-DD 형식으로 입력하세요.";
    } else {
      const parsed = new Date(`${values.joinedAt}T00:00:00Z`);
      if (Number.isNaN(parsed.getTime())) {
        errors.joinedAt = "올바른 날짜를 선택하세요.";
      }
    }
  }

  if (values.notes.length > 2000) {
    errors.notes = "메모는 2,000자 이내로 입력하세요.";
  }

  return { ok: Object.keys(errors).length === 0, values, errors };
}

export function today(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function formatDate(value: string): string {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatAffiliation(rank: string, affiliation: string): string {
  const parts = [rank, affiliation].filter((part) => part.trim().length > 0);
  return parts.length > 0 ? parts.join(", ") : "소속 미기재";
}

type Filters = { q?: string; status?: VolunteerStatus };

function buildWhere(filters: Filters) {
  const conditions = [];

  if (filters.q) {
    const term = `%${filters.q}%`;
    conditions.push(
      or(
        like(volunteers.name, term),
        like(volunteers.affiliation, term),
        like(volunteers.specialty, term),
        like(volunteers.region, term),
      ),
    );
  }

  if (filters.status) {
    conditions.push(eq(volunteers.status, filters.status));
  }

  return conditions.length ? and(...conditions) : undefined;
}

export async function listVolunteers(
  d1: D1Database,
  filters: Filters,
): Promise<Volunteer[]> {
  const db = getDb(d1);
  return db
    .select()
    .from(volunteers)
    .where(buildWhere(filters))
    .orderBy(
      sql`case ${volunteers.status} when 'active' then 0 when 'standby' then 1 else 2 end`,
      asc(volunteers.name),
    );
}

export async function countVolunteers(
  d1: D1Database,
  filters: Filters,
): Promise<number> {
  const db = getDb(d1);
  const rows = await db
    .select({ value: count() })
    .from(volunteers)
    .where(buildWhere(filters));
  return rows[0]?.value ?? 0;
}

export type StatusCounts = Record<VolunteerStatus, number> & { total: number };

export async function getStatusCounts(d1: D1Database): Promise<StatusCounts> {
  const db = getDb(d1);
  const rows = await db
    .select({ status: volunteers.status, value: count() })
    .from(volunteers)
    .groupBy(volunteers.status);

  const counts: StatusCounts = { active: 0, standby: 0, inactive: 0, total: 0 };
  for (const row of rows) {
    if (isStatus(row.status)) {
      counts[row.status] = row.value;
      counts.total += row.value;
    }
  }
  return counts;
}

export async function listRecentVolunteers(
  d1: D1Database,
  limit = 5,
): Promise<Volunteer[]> {
  const db = getDb(d1);
  return db
    .select()
    .from(volunteers)
    .orderBy(desc(volunteers.id))
    .limit(limit);
}

export async function getVolunteer(
  d1: D1Database,
  id: number,
): Promise<Volunteer | undefined> {
  const db = getDb(d1);
  const rows = await db
    .select()
    .from(volunteers)
    .where(eq(volunteers.id, id))
    .limit(1);
  return rows[0];
}

export async function createVolunteer(
  d1: D1Database,
  values: VolunteerFormValues,
): Promise<void> {
  const db = getDb(d1);
  const now = new Date().toISOString();
  await db.insert(volunteers).values({ ...values, createdAt: now, updatedAt: now });
}

export async function updateVolunteer(
  d1: D1Database,
  id: number,
  values: VolunteerFormValues,
): Promise<void> {
  const db = getDb(d1);
  await db
    .update(volunteers)
    .set({ ...values, updatedAt: new Date().toISOString() })
    .where(eq(volunteers.id, id));
}

export async function deleteVolunteer(d1: D1Database, id: number): Promise<void> {
  const db = getDb(d1);
  await db.delete(volunteers).where(eq(volunteers.id, id));
}

export function parseVolunteerId(value: string): number | null {
  if (!/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
