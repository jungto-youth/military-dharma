import { sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const volunteers = sqliteTable("volunteers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  affiliation: text("affiliation").notNull().default(""),
  rank: text("rank").notNull().default(""),
  specialty: text("specialty").notNull().default(""),
  region: text("region").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  status: text("status", { enum: ["active", "standby", "inactive"] })
    .notNull()
    .default("standby"),
  joinedAt: text("joined_at").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type Volunteer = typeof volunteers.$inferSelect;
export type VolunteerStatus = Volunteer["status"];
export type NewVolunteer = typeof volunteers.$inferInsert;

// ALLOWED_EMAILS 환경 변수에 없는 일반 사용자를 예외적으로 허용하는 목록.
export const allowedEmails = sqliteTable("allowed_emails", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  memo: text("memo").notNull().default(""),
  createdBy: text("created_by").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type AllowedEmail = typeof allowedEmails.$inferSelect;

// 바라지 모집 일정. kind가 stay면 숙박형 회차, shift면 일일 공양 타임입니다.
export const barajiEvents = sqliteTable("baraji_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  round: text("round").notNull().default("2026-11"),
  kind: text("kind", { enum: ["stay", "shift"] }).notNull(),
  program: text("program").notNull().default(""),
  title: text("title").notNull().default(""),
  startsAt: text("starts_at").notNull(),
  endsAt: text("ends_at").notNull(),
  capacity: integer("capacity"),
  isOpen: integer("is_open", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type BarajiEvent = typeof barajiEvents.$inferSelect;
export type BarajiEventKind = BarajiEvent["kind"];

export const applications = sqliteTable("applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reference: text("reference").notNull().unique(),
  accessToken: text("access_token").notNull().unique(),
  round: text("round").notNull().default("2026-11"),
  type: text("type", { enum: ["stay", "shift"] }).notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  phoneNormalized: text("phone_normalized").notNull(),
  affiliation: text("affiliation").notNull().default(""),
  membership: text("membership", {
    enum: ["jeonbeop", "general", "other"],
  })
    .notNull()
    .default("general"),
  membershipOther: text("membership_other").notNull().default(""),
  gender: text("gender", { enum: ["female", "male"] }).notNull(),
  lodging: text("lodging", { enum: ["yes", "no"] })
    .notNull()
    .default("yes"),
  telegram: text("telegram").notNull().default(""),
  motivation: text("motivation").notNull().default(""),
  privacyAgreedAt: text("privacy_agreed_at").notNull().default(""),
  status: text("status", {
    enum: ["received", "confirmed", "waitlist", "cancelled"],
  })
    .notNull()
    .default("received"),
  volunteerId: integer("volunteer_id"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type Application = typeof applications.$inferSelect;
export type ApplicationType = Application["type"];
export type ApplicationStatus = Application["status"];
export type NewApplication = typeof applications.$inferInsert;

export const applicationEvents = sqliteTable(
  "application_events",
  {
    applicationId: integer("application_id").notNull(),
    eventId: integer("event_id").notNull(),
  },
  (table) => [primaryKey({ columns: [table.applicationId, table.eventId] })],
);

export type ApplicationEvent = typeof applicationEvents.$inferSelect;
