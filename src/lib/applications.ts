import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  like,
  or,
  sql,
} from "drizzle-orm";
import { getDb } from "../db/client";
import {
  applicationEvents,
  applications,
  barajiEvents,
  volunteers,
  type Application,
  type ApplicationStatus,
  type ApplicationType,
  type BarajiEvent,
} from "../db/schema";
import { formatEventRange, formatShortEvent, ROUND, stayNights, type EventWithCount } from "./baraji";
import { today } from "./volunteers";

export const AFFILIATIONS = [
  "서울북부",
  "서울남부",
  "서울서부",
  "서울동부",
  "경기북부",
  "경기남부",
  "경기동부",
  "경기서부",
  "대구경북",
  "부산경남",
  "대전광주",
  "충청",
  "불교대·경전대",
  "기타",
] as const;

export const MEMBERSHIPS = {
  jeonbeop: "전법",
  general: "일반",
  other: "기타",
} as const;

export const GENDERS = {
  female: "여",
  male: "남",
} as const;

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "received",
  "confirmed",
  "waitlist",
  "cancelled",
];

export const APPLICATION_STATUS_META: Record<
  ApplicationStatus,
  { label: string; dot: string }
> = {
  received: { label: "접수", dot: "bg-standby" },
  confirmed: { label: "확정", dot: "bg-active" },
  waitlist: { label: "대기", dot: "bg-idle" },
  cancelled: { label: "취소", dot: "bg-alert" },
};

export const APPLICATION_TYPE_META: Record<ApplicationType, string> = {
  stay: "숙박형",
  shift: "일일",
};

export type ApplicationFormValues = {
  type: "" | ApplicationType;
  name: string;
  phone: string;
  affiliation: string;
  membership: "" | keyof typeof MEMBERSHIPS;
  membershipOther: string;
  gender: "" | keyof typeof GENDERS;
  lodging: "" | "yes" | "no";
  telegram: string;
  motivation: string;
  privacyAgreed: boolean;
  website: string;
};

export type ApplicationFieldErrors = Partial<
  Record<keyof ApplicationFormValues | "events" | "privacy", string>
>;

export type ParsedApplication = {
  values: ApplicationFormValues;
  eventIds: number[];
};

export type ApplicationWithEvents = Application & { events: BarajiEvent[] };

type BodyValue = string | File | (string | File)[];

export function emptyApplicationValues(
  type: ApplicationFormValues["type"] = "",
): ApplicationFormValues {
  return {
    type,
    name: "",
    phone: "",
    affiliation: "",
    membership: "",
    membershipOther: "",
    gender: "",
    lodging: "yes",
    telegram: "",
    motivation: "",
    privacyAgreed: false,
    website: "",
  };
}

function readOne(body: Record<string, BodyValue>, key: string): string {
  const value = body[key];
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    const first = value.find((item) => typeof item === "string");
    return typeof first === "string" ? first.trim() : "";
  }
  return "";
}

function readMany(
  body: Record<string, BodyValue>,
  key: string,
): Array<string | File> {
  const value = body[key];
  if (Array.isArray(value)) return value;
  return value === undefined ? [] : [value];
}

export function parseApplicationForm(
  body: Record<string, BodyValue>,
): ParsedApplication {
  const rawType = readOne(body, "type");
  const type =
    rawType === "stay" || rawType === "shift" ? rawType : "";

  const rawMembership = readOne(body, "membership");
  const membership =
    rawMembership === "jeonbeop" ||
    rawMembership === "general" ||
    rawMembership === "other"
      ? rawMembership
      : "";

  const rawGender = readOne(body, "gender");
  const gender =
    rawGender === "female" || rawGender === "male" ? rawGender : "";

  const rawLodging = readOne(body, "lodging");
  const lodging =
    rawLodging === "no" ? "no" : rawLodging === "yes" ? "yes" : "";

  const privacy = readOne(body, "privacy");

  const values: ApplicationFormValues = {
    type,
    name: readOne(body, "name").slice(0, 40),
    phone: readOne(body, "phone").slice(0, 30),
    affiliation: readOne(body, "affiliation").slice(0, 60),
    membership,
    membershipOther: readOne(body, "membershipOther").slice(0, 40),
    gender,
    lodging,
    telegram: readOne(body, "telegram").replace(/^@/, "").slice(0, 40),
    motivation: readOne(body, "motivation").slice(0, 1000),
    privacyAgreed: privacy === "on" || privacy === "yes" || privacy === "true",
    website: readOne(body, "website"),
  };

  const eventIds = readMany(body, "eventIds")
    .map((value) => {
      if (typeof value !== "string" || !/^\d+$/.test(value)) return 0;
      return Number(value);
    })
    .filter((id) => Number.isSafeInteger(id) && id > 0);

  return { values, eventIds: [...new Set(eventIds)] };
}

export function validateApplicationBasics(
  values: ApplicationFormValues,
  eventIds: number[],
): ApplicationFieldErrors {
  const errors: ApplicationFieldErrors = {};

  if (!values.type) {
    errors.type = "참여 방식을 선택하세요.";
  }

  if (eventIds.length === 0) {
    errors.events = "참여할 일정을 하나 이상 선택하세요.";
  }

  if (!values.name) {
    errors.name = "이름을 입력하세요.";
  } else if (values.name.length < 2) {
    errors.name = "이름은 2자 이상 입력하세요.";
  }

  const digits = normalizePhone(values.phone);
  if (!values.phone) {
    errors.phone = "연락처를 입력하세요.";
  } else if (!/^0\d{8,10}$/.test(digits)) {
    errors.phone = "연락처를 정확히 입력하세요. 예: 010-1234-5678";
  }

  if (!values.affiliation) {
    errors.affiliation = "소속을 선택하세요.";
  }

  if (!values.membership) {
    errors.membership = "회원구분을 선택하세요.";
  } else if (values.membership === "other" && !values.membershipOther) {
    errors.membershipOther = "기타 회원구분을 입력하세요.";
  }

  if (!values.gender) {
    errors.gender = "성별을 선택하세요.";
  }

  if (values.type === "stay" && !values.lodging) {
    errors.lodging = "숙박 여부를 선택하세요.";
  }

  if (values.motivation.length > 1000) {
    errors.motivation = "신청 동기는 1,000자 이내로 입력하세요.";
  }

  if (!values.privacyAgreed) {
    errors.privacy = "개인정보 수집·이용에 동의해야 신청할 수 있습니다.";
  }

  if (values.website) {
    errors.events = "요청을 처리할 수 없습니다. 잠시 후 다시 시도하세요.";
  }

  return errors;
}

export async function validateApplication(
  d1: D1Database,
  values: ApplicationFormValues,
  eventIds: number[],
): Promise<{ errors: ApplicationFieldErrors; events: EventWithCount[] }> {
  const errors = validateApplicationBasics(values, eventIds);

  if (eventIds.length === 0) return { errors, events: [] };

  const db = getDb(d1);
  const rows = await db
    .select()
    .from(barajiEvents)
    .where(inArray(barajiEvents.id, eventIds));

  if (rows.length !== eventIds.length) {
    errors.events = "선택한 일정을 찾을 수 없습니다. 다시 선택하세요.";
    return { errors, events: [] };
  }

  // 참여 방식을 바꾸면 숨겨진 패널의 입력이 함께 전송될 수 있습니다.
  // 선택한 방식과 같은 종류의 일정만 사용합니다.
  const matching = rows.filter((event) => event.kind === values.type);

  if (matching.length === 0) {
    errors.events =
      values.type === "stay"
        ? "숙박형 일정을 하나 선택하세요."
        : "일일 일정을 하나 이상 선택하세요.";
    return { errors, events: [] };
  }

  if (values.type === "stay" && matching.length !== 1) {
    errors.events = "숙박형은 한 회차만 선택할 수 있습니다.";
    return { errors, events: [] };
  }

  const selectedIds = matching.map((event) => event.id);

  const counts = await db
    .select({ eventId: applicationEvents.eventId, value: count() })
    .from(applicationEvents)
    .innerJoin(
      applications,
      eq(applications.id, applicationEvents.applicationId),
    )
    .where(
      and(
        inArray(applicationEvents.eventId, selectedIds),
        inArray(applications.status, ["received", "confirmed"]),
      ),
    )
    .groupBy(applicationEvents.eventId);

  const countsById = new Map(counts.map((row) => [row.eventId, row.value]));
  const now = new Date();

  for (const event of matching) {
    const withCount: EventWithCount = {
      ...event,
      activeCount: countsById.get(event.id) ?? 0,
    };

    if (!event.isOpen) {
      errors.events = `${formatShortEvent(event)} 일정은 마감되었습니다.`;
      break;
    }

    if (new Date(event.startsAt).getTime() <= now.getTime()) {
      errors.events = `${formatShortEvent(event)} 일정은 이미 시작되었습니다.`;
      break;
    }

    if (
      event.capacity !== null &&
      withCount.activeCount >= event.capacity
    ) {
      errors.events = `${formatShortEvent(event)} 일정의 정원이 찼습니다.`;
      break;
    }
  }

  if (!errors.events && errors.phone === undefined) {
    const duplicates = await db
      .select({ id: applications.id })
      .from(applications)
      .innerJoin(
        applicationEvents,
        eq(applicationEvents.applicationId, applications.id),
      )
      .where(
        and(
          eq(applications.phoneNormalized, normalizePhone(values.phone)),
          inArray(applications.status, ["received", "confirmed", "waitlist"]),
          inArray(applicationEvents.eventId, selectedIds),
        ),
      )
      .limit(1);

    if (duplicates.length > 0) {
      errors.events = "이미 신청한 일정이 포함되어 있습니다.";
    }
  }

  const events = matching
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((event) => ({
      ...event,
      activeCount: countsById.get(event.id) ?? 0,
    }));

  return { errors, events };
}

export async function createApplication(
  d1: D1Database,
  values: ApplicationFormValues,
  events: BarajiEvent[],
): Promise<Application> {
  const db = getDb(d1);
  const now = new Date().toISOString();
  const reference = createReference();
  const accessToken = createAccessToken();

  await db.insert(applications).values({
    reference,
    accessToken,
    round: ROUND,
    type: values.type as ApplicationType,
    name: values.name,
    phone: values.phone,
    phoneNormalized: normalizePhone(values.phone),
    affiliation: values.affiliation,
    membership: values.membership as keyof typeof MEMBERSHIPS,
    membershipOther:
      values.membership === "other" ? values.membershipOther : "",
    gender: values.gender as keyof typeof GENDERS,
    lodging: values.type === "stay" ? (values.lodging as "yes" | "no") : "no",
    telegram: values.telegram,
    motivation: values.motivation,
    privacyAgreedAt: now,
    status: "received",
    createdAt: now,
    updatedAt: now,
  });

  const created = await db
    .select()
    .from(applications)
    .where(eq(applications.accessToken, accessToken))
    .limit(1);

  const application = created[0];
  if (!application) {
    throw new Error("생성한 신청서를 찾을 수 없습니다.");
  }

  await db.insert(applicationEvents).values(
    events.map((event) => ({
      applicationId: application.id,
      eventId: event.id,
    })),
  );

  return application;
}

function createReference(): string {
  return `B26-${randomCode(6)}`;
}

function createAccessToken(): string {
  return `${randomCode(20)}${Date.now().toString(36)}`;
}

function randomCode(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let value = "";
  for (const byte of bytes) {
    value += alphabet[byte % alphabet.length];
  }
  return value;
}

export function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatPhone(value: string): string {
  const digits = normalizePhone(value);
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    if (digits.startsWith("02")) {
      return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 9) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
  }
  return value;
}

export type ApplicationFilters = {
  q?: string;
  status?: ApplicationStatus;
  type?: ApplicationType;
  eventId?: number;
};

function buildApplicationWhere(filters: ApplicationFilters) {
  const conditions = [];

  if (filters.q) {
    const term = `%${filters.q}%`;
    conditions.push(
      or(
        like(applications.name, term),
        like(applications.phone, term),
        like(applications.affiliation, term),
        like(applications.reference, term),
      ),
    );
  }

  if (filters.status) {
    conditions.push(eq(applications.status, filters.status));
  }

  if (filters.type) {
    conditions.push(eq(applications.type, filters.type));
  }

  if (filters.eventId) {
    conditions.push(
      sql`${applications.id} in (select ${applicationEvents.applicationId} from ${applicationEvents} where ${applicationEvents.eventId} = ${filters.eventId})`,
    );
  }

  return conditions.length ? and(...conditions) : undefined;
}

export async function listApplications(
  d1: D1Database,
  filters: ApplicationFilters,
): Promise<ApplicationWithEvents[]> {
  const db = getDb(d1);
  const rows = await db
    .select()
    .from(applications)
    .where(buildApplicationWhere(filters))
    .orderBy(desc(applications.id));

  return attachEvents(d1, rows);
}

export async function countApplications(
  d1: D1Database,
  filters: ApplicationFilters,
): Promise<number> {
  const db = getDb(d1);
  const rows = await db
    .select({ value: count() })
    .from(applications)
    .where(buildApplicationWhere(filters));
  return rows[0]?.value ?? 0;
}

export async function attachEvents(
  d1: D1Database,
  rows: Application[],
): Promise<ApplicationWithEvents[]> {
  if (rows.length === 0) return [];

  const db = getDb(d1);
  const ids = rows.map((row) => row.id);
  const links = await db
    .select({
      applicationId: applicationEvents.applicationId,
      event: barajiEvents,
    })
    .from(applicationEvents)
    .innerJoin(barajiEvents, eq(barajiEvents.id, applicationEvents.eventId))
    .where(inArray(applicationEvents.applicationId, ids))
    .orderBy(asc(barajiEvents.sortOrder));

  const map = new Map<number, BarajiEvent[]>();
  for (const link of links) {
    const events = map.get(link.applicationId) ?? [];
    events.push(link.event);
    map.set(link.applicationId, events);
  }

  return rows.map((row) => ({ ...row, events: map.get(row.id) ?? [] }));
}

export async function getApplicationByToken(
  d1: D1Database,
  token: string,
): Promise<ApplicationWithEvents | undefined> {
  const db = getDb(d1);
  const rows = await db
    .select()
    .from(applications)
    .where(eq(applications.accessToken, token))
    .limit(1);

  const attached = await attachEvents(d1, rows);
  return attached[0];
}

export async function getApplicationById(
  d1: D1Database,
  id: number,
): Promise<ApplicationWithEvents | undefined> {
  const db = getDb(d1);
  const rows = await db
    .select()
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);

  const attached = await attachEvents(d1, rows);
  return attached[0];
}

export type ApplicationStatusCounts = Record<ApplicationStatus, number> & {
  total: number;
};

export async function getApplicationStatusCounts(
  d1: D1Database,
): Promise<ApplicationStatusCounts> {
  const db = getDb(d1);
  const rows = await db
    .select({ status: applications.status, value: count() })
    .from(applications)
    .groupBy(applications.status);

  const counts: ApplicationStatusCounts = {
    received: 0,
    confirmed: 0,
    waitlist: 0,
    cancelled: 0,
    total: 0,
  };

  for (const row of rows) {
    counts[row.status] = row.value;
    counts.total += row.value;
  }

  return counts;
}

export async function listRecentApplications(
  d1: D1Database,
  limit = 5,
): Promise<ApplicationWithEvents[]> {
  const db = getDb(d1);
  const rows = await db
    .select()
    .from(applications)
    .orderBy(desc(applications.id))
    .limit(limit);
  return attachEvents(d1, rows);
}

export async function updateApplicationStatus(
  d1: D1Database,
  id: number,
  status: ApplicationStatus,
): Promise<ApplicationWithEvents | undefined> {
  const application = await getApplicationById(d1, id);
  if (!application) return undefined;

  let volunteerId = application.volunteerId;

  if (status === "confirmed" && !volunteerId) {
    volunteerId = await ensureVolunteerForApplication(d1, application);
  }

  const db = getDb(d1);
  await db
    .update(applications)
    .set({
      status,
      volunteerId,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(applications.id, id));

  return getApplicationById(d1, id);
}

async function ensureVolunteerForApplication(
  d1: D1Database,
  application: ApplicationWithEvents,
): Promise<number> {
  const db = getDb(d1);
  const normalized = application.phoneNormalized;

  const existing = await db
    .select({ id: volunteers.id })
    .from(volunteers)
    .where(normalizedPhoneSql(normalized))
    .limit(1);

  if (existing[0]) return existing[0].id;

  const now = new Date().toISOString();
  const summary =
    application.events
      .map((event) =>
        event.kind === "stay"
          ? `${event.title} (${stayNights(event)})`
          : formatShortEvent(event),
      )
      .join(", ") || "일정 미정";

  await db.insert(volunteers).values({
    name: application.name,
    affiliation: application.affiliation,
    rank: "",
    specialty: "",
    region: "",
    phone: formatPhone(application.phone),
    email: "",
    status: "active",
    joinedAt: today(),
    notes: `${ROUND} 바라지 · ${summary}`,
    createdAt: now,
    updatedAt: now,
  });

  const created = await db
    .select({ id: volunteers.id })
    .from(volunteers)
    .where(normalizedPhoneSql(normalized))
    .orderBy(desc(volunteers.id))
    .limit(1);

  return created[0]?.id ?? 0;
}

function normalizedPhoneSql(normalized: string) {
  return sql`replace(replace(replace(replace(replace(${volunteers.phone}, '-', ''), ' ', ''), '(', ''), ')', ''), '+', '') = ${normalized}`;
}

export function applicationEventSummary(events: BarajiEvent[]): string {
  const first = events[0];
  if (!first) return "—";
  if (first.kind === "stay") return first.title;
  if (events.length === 1) return formatShortEvent(first);
  return `${formatShortEvent(first)} 외 ${events.length - 1}건`;
}

export function applicationEventDetail(events: BarajiEvent[]): string {
  if (events.length === 0) return "—";
  return events
    .map((event) =>
      event.kind === "stay"
        ? `${event.title} · ${formatEventRange(event)}`
        : formatShortEvent(event),
    )
    .join(" / ");
}

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return (
    typeof value === "string" &&
    (APPLICATION_STATUSES as string[]).includes(value)
  );
}

export function isApplicationType(value: unknown): value is ApplicationType {
  return value === "stay" || value === "shift";
}

export type CsvRow = Record<string, string>;

export function buildCsv(headers: string[], rows: CsvRow[]): string {
  const lines = [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header] ?? "")).join(",")),
  ];
  return `\uFEFF${lines.join("\r\n")}`;
}

function csvCell(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
