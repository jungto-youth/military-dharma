import type { VolunteerStatus } from "../db/schema";

export const STATUSES = ["active", "standby", "inactive"] as const;

export const STATUS_META: Record<VolunteerStatus, { label: string; dot: string }> = {
  active: { label: "활동중", dot: "bg-active" },
  standby: { label: "대기", dot: "bg-standby" },
  inactive: { label: "휴면", dot: "bg-idle" },
};

export function isStatus(value: unknown): value is VolunteerStatus {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}
