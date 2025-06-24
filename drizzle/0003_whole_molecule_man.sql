CREATE TABLE `active_visitors` (
	`session_id` text PRIMARY KEY NOT NULL,
	`user_id` integer,
	`current_page` text,
	`ip` text,
	`country` text,
	`city` text,
	`device` text,
	`browser` text,
	`source` text,
	`last_seen` text DEFAULT CURRENT_TIMESTAMP,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `api_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text,
	`user_id` integer,
	`method` text NOT NULL,
	`path` text NOT NULL,
	`status_code` integer NOT NULL,
	`response_time` integer,
	`user_agent` text,
	`ip` text,
	`referer` text,
	`error_message` text,
	`request_size` integer,
	`response_size` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `daily_stats` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`total_sessions` integer DEFAULT 0,
	`total_page_views` integer DEFAULT 0,
	`total_api_requests` integer DEFAULT 0,
	`unique_visitors` integer DEFAULT 0,
	`desktop_sessions` integer DEFAULT 0,
	`mobile_sessions` integer DEFAULT 0,
	`tablet_sessions` integer DEFAULT 0,
	`bounce_rate` real DEFAULT 0,
	`avg_session_duration` real DEFAULT 0,
	`avg_page_views` real DEFAULT 0,
	`top_page` text,
	`top_source` text,
	`top_country` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `daily_stats_date_unique` ON `daily_stats` (`date`);--> statement-breakpoint
CREATE TABLE `page_views` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_id` text NOT NULL,
	`user_id` integer,
	`path` text NOT NULL,
	`title` text,
	`referrer` text,
	`user_agent` text,
	`ip` text,
	`country` text,
	`city` text,
	`device` text,
	`browser` text,
	`os` text,
	`source` text,
	`medium` text,
	`campaign` text,
	`duration` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer,
	`ip` text,
	`user_agent` text,
	`country` text,
	`city` text,
	`device` text,
	`browser` text,
	`os` text,
	`source` text,
	`medium` text,
	`campaign` text,
	`landing_page` text,
	`exit_page` text,
	`page_count` integer DEFAULT 1,
	`duration` integer,
	`bounced` integer DEFAULT false,
	`converted` integer DEFAULT false,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
