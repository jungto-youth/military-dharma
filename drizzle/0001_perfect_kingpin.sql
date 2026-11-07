CREATE TABLE `allowed_emails` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`memo` text DEFAULT '' NOT NULL,
	`created_by` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `allowed_emails_email_unique` ON `allowed_emails` (`email`);
--> statement-breakpoint
INSERT OR IGNORE INTO `allowed_emails` (`email`, `memo`, `created_by`) VALUES ('chl11wq12@gmail.com', '초기 예외 허용', 'migration');