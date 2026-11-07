CREATE TABLE `application_events` (
	`application_id` integer NOT NULL,
	`event_id` integer NOT NULL,
	PRIMARY KEY(`application_id`, `event_id`)
);
--> statement-breakpoint
CREATE TABLE `applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reference` text NOT NULL,
	`access_token` text NOT NULL,
	`round` text DEFAULT '2026-11' NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`phone_normalized` text NOT NULL,
	`affiliation` text DEFAULT '' NOT NULL,
	`membership` text DEFAULT 'general' NOT NULL,
	`membership_other` text DEFAULT '' NOT NULL,
	`gender` text NOT NULL,
	`lodging` text DEFAULT 'yes' NOT NULL,
	`telegram` text DEFAULT '' NOT NULL,
	`motivation` text DEFAULT '' NOT NULL,
	`privacy_agreed_at` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'received' NOT NULL,
	`volunteer_id` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `applications_reference_unique` ON `applications` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `applications_access_token_unique` ON `applications` (`access_token`);--> statement-breakpoint
CREATE TABLE `baraji_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`round` text DEFAULT '2026-11' NOT NULL,
	`kind` text NOT NULL,
	`program` text DEFAULT '' NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`starts_at` text NOT NULL,
	`ends_at` text NOT NULL,
	`capacity` integer,
	`is_open` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `baraji_events` (`round`, `kind`, `program`, `title`, `starts_at`, `ends_at`, `capacity`, `is_open`, `sort_order`) VALUES
  ('2026-11', 'stay', '서울여행', '서울여행 · 1박 2일', '2026-11-12T13:30:00+09:00', '2026-11-13T14:30:00+09:00', NULL, true, 10),
  ('2026-11', 'stay', '행복학교', '행복학교 · 1박 2일 A', '2026-11-18T13:30:00+09:00', '2026-11-19T14:30:00+09:00', NULL, true, 20),
  ('2026-11', 'stay', '행복학교', '행복학교 · 1박 2일 B', '2026-11-19T13:30:00+09:00', '2026-11-20T14:30:00+09:00', NULL, true, 30),
  ('2026-11', 'stay', '행복학교', '행복학교 · 2박 3일', '2026-11-18T13:30:00+09:00', '2026-11-20T14:30:00+09:00', NULL, true, 40),
  ('2026-11', 'shift', '일일 공양', '점심 공양', '2026-11-12T09:00:00+09:00', '2026-11-12T14:00:00+09:00', NULL, true, 110),
  ('2026-11', 'shift', '일일 공양', '저녁 공양', '2026-11-12T13:30:00+09:00', '2026-11-12T19:30:00+09:00', NULL, true, 120),
  ('2026-11', 'shift', '일일 공양', '점심 공양', '2026-11-13T09:00:00+09:00', '2026-11-13T14:00:00+09:00', NULL, true, 210),
  ('2026-11', 'shift', '일일 공양', '저녁 공양', '2026-11-18T13:30:00+09:00', '2026-11-18T19:30:00+09:00', NULL, true, 310),
  ('2026-11', 'shift', '일일 공양', '점심 공양', '2026-11-19T09:00:00+09:00', '2026-11-19T14:00:00+09:00', NULL, true, 410),
  ('2026-11', 'shift', '일일 공양', '저녁 공양', '2026-11-19T13:30:00+09:00', '2026-11-19T19:30:00+09:00', NULL, true, 420),
  ('2026-11', 'shift', '일일 공양', '점심 공양', '2026-11-20T09:00:00+09:00', '2026-11-20T14:00:00+09:00', NULL, true, 510);
