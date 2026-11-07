import { asc, count, eq, inArray } from "drizzle-orm";
import { getDb } from "../db/client";
import {
  applicationEvents,
  applications,
  barajiEvents,
  type ApplicationStatus,
  type BarajiEvent,
} from "../db/schema";

export const ROUND = "2026-11";

export const PUBLIC_SITE_NAME = "군청년 바라지";
export const PUBLIC_SITE_TAGLINE = "정토사회문화회관 자원봉사 프로그램";
export const VENUE = "정토사회문화회관";
export const CONTACT_PHONE = "010-6665-7601";
export const CONTACT_PHONE_HREF = "tel:01066657601";

export const ACTIVE_STATUSES: ApplicationStatus[] = ["received", "confirmed"];

export type EventWithCount = BarajiEvent & { activeCount: number };

export type Availability = {
  state: "open" | "full" | "closed";
  remaining: number | null;
  label: string;
};

export function availabilityOf(
  event: EventWithCount,
  now = new Date(),
): Availability {
  if (!event.isOpen) {
    return { state: "closed", remaining: 0, label: "마감" };
  }

  if (new Date(event.startsAt).getTime() <= now.getTime()) {
    return { state: "closed", remaining: 0, label: "마감" };
  }

  if (event.capacity !== null) {
    const remaining = Math.max(0, event.capacity - event.activeCount);
    if (remaining === 0) {
      return { state: "full", remaining: 0, label: "마감" };
    }
    return { state: "open", remaining, label: `잔여 ${remaining}` };
  }

  return { state: "open", remaining: null, label: "모집중" };
}

export async function listEventsWithCounts(
  d1: D1Database,
): Promise<EventWithCount[]> {
  const db = getDb(d1);
  const events = await db
    .select()
    .from(barajiEvents)
    .orderBy(asc(barajiEvents.sortOrder), asc(barajiEvents.startsAt));

  if (events.length === 0) return [];

  const rows = await db
    .select({
      eventId: applicationEvents.eventId,
      value: count(),
    })
    .from(applicationEvents)
    .innerJoin(
      applications,
      eq(applications.id, applicationEvents.applicationId),
    )
    .where(inArray(applications.status, ACTIVE_STATUSES))
    .groupBy(applicationEvents.eventId);

  const counts = new Map(rows.map((row) => [row.eventId, row.value]));

  return events.map((event) => ({
    ...event,
    activeCount: counts.get(event.id) ?? 0,
  }));
}

export function splitEvents(events: EventWithCount[]): {
  stay: EventWithCount[];
  shift: EventWithCount[];
} {
  return {
    stay: events.filter((event) => event.kind === "stay"),
    shift: events.filter((event) => event.kind === "shift"),
  };
}

export type ShiftDay = {
  key: string;
  dateLabel: string;
  weekday: string;
  lunch?: EventWithCount;
  dinner?: EventWithCount;
  any: EventWithCount[];
};

export function groupShiftDays(events: EventWithCount[]): ShiftDay[] {
  const days = new Map<string, ShiftDay>();

  for (const event of events) {
    const key = kstDateKey(event.startsAt);
    const existing = days.get(key) ?? {
      key,
      dateLabel: formatDayMonth(event.startsAt),
      weekday: formatWeekday(event.startsAt),
      any: [],
    };

    existing.any.push(event);

    const hour = kstHour(event.startsAt);
    if (hour < 12) {
      existing.lunch = event;
    } else {
      existing.dinner = event;
    }

    days.set(key, existing);
  }

  return [...days.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export function parseEventIds(values: Array<string | File>): number[] {
  const ids = new Set<number>();

  for (const value of values) {
    if (typeof value !== "string" || !/^\d+$/.test(value)) continue;
    const id = Number(value);
    if (Number.isSafeInteger(id) && id > 0) ids.add(id);
  }

  return [...ids];
}

export function formatDayMonth(value: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));

  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  return `${month}.${day}`;
}

export function formatWeekday(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    weekday: "short",
  }).format(new Date(value));
}

export function formatClock(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function formatEventDate(value: string): string {
  return `${formatDayMonth(value)}(${formatWeekday(value)})`;
}

export function formatEventRange(event: BarajiEvent): string {
  if (event.kind === "stay") {
    return `${formatEventDate(event.startsAt)} ${formatClock(event.startsAt)} → ${formatEventDate(event.endsAt)} ${formatClock(event.endsAt)}`;
  }

  return `${formatEventDate(event.startsAt)} ${formatClock(event.startsAt)}–${formatClock(event.endsAt)}`;
}

export function formatShortEvent(event: BarajiEvent): string {
  return `${formatDayMonth(event.startsAt)} ${formatWeekday(event.startsAt)} ${formatClock(event.startsAt)}–${formatClock(event.endsAt)}`;
}

export function stayNights(event: BarajiEvent): string {
  const start = new Date(event.startsAt);
  const end = new Date(event.endsAt);
  const nights = Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  );

  if (nights <= 0) return "당일";
  return `${nights}박 ${nights + 1}일`;
}

export function kstDateKey(value: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function kstHour(value: string): number {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Seoul",
      hour: "2-digit",
      hour12: false,
    }).format(new Date(value)),
  );
}

export function formatTimestampKst(value: string): string {
  if (!value) return "—";
  const iso = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return value;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("month")}.${part("day")} ${part("hour")}:${part("minute")}`;
}
