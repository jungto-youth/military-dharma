import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
