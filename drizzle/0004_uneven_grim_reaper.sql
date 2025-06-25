CREATE TABLE `document_signers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`signing_request_id` integer NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'Signer',
	`status` text DEFAULT 'pending',
	`signed_at` text,
	`declined_at` text,
	`decline_reason` text,
	`signature_data` text,
	`signature_type` text,
	`ip_address` text,
	`user_agent` text,
	`access_token` text NOT NULL,
	`accessed_at` text,
	`access_count` integer DEFAULT 0,
	`signing_order` integer DEFAULT 1,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`signing_request_id`) REFERENCES `signing_requests`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `document_signers_access_token_unique` ON `document_signers` (`access_token`);--> statement-breakpoint
CREATE TABLE `qr_code_scans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`qr_code_id` integer NOT NULL,
	`ip` text,
	`user_agent` text,
	`country` text,
	`city` text,
	`device` text,
	`browser` text,
	`os` text,
	`scanned_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`qr_code_id`) REFERENCES `qr_codes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `qr_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`data` text NOT NULL,
	`size` integer DEFAULT 256,
	`foreground_color` text DEFAULT '#000000',
	`background_color` text DEFAULT '#ffffff',
	`error_correction_level` text DEFAULT 'M',
	`qr_code_url` text NOT NULL,
	`format` text DEFAULT 'png',
	`scans` integer DEFAULT 0,
	`last_scanned_at` text,
	`shortened_url_id` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`shortened_url_id`) REFERENCES `shortened_urls`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `shortened_urls` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`original_url` text NOT NULL,
	`short_code` text NOT NULL,
	`custom_alias` text,
	`description` text,
	`clicks` integer DEFAULT 0,
	`unique_clicks` integer DEFAULT 0,
	`last_clicked_at` text,
	`is_active` integer DEFAULT true,
	`expires_at` text,
	`password` text,
	`qr_code_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shortened_urls_short_code_unique` ON `shortened_urls` (`short_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `shortened_urls_custom_alias_unique` ON `shortened_urls` (`custom_alias`);--> statement-breakpoint
CREATE TABLE `signing_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`signing_request_id` integer NOT NULL,
	`signer_id` integer,
	`event_type` text NOT NULL,
	`event_data` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`signing_request_id`) REFERENCES `signing_requests`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`signer_id`) REFERENCES `document_signers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `signing_requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`document_name` text NOT NULL,
	`document_url` text NOT NULL,
	`document_size` integer,
	`document_type` text,
	`title` text NOT NULL,
	`message` text,
	`status` text DEFAULT 'draft',
	`expires_at` text NOT NULL,
	`reminder_enabled` integer DEFAULT true,
	`reminder_days` integer DEFAULT 3,
	`signing_order` text DEFAULT 'parallel',
	`requires_all_signatures` integer DEFAULT true,
	`sent_at` text,
	`completed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `url_clicks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`shortened_url_id` integer NOT NULL,
	`ip` text,
	`user_agent` text,
	`referer` text,
	`country` text,
	`city` text,
	`device` text,
	`browser` text,
	`os` text,
	`clicked_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`shortened_url_id`) REFERENCES `shortened_urls`(`id`) ON UPDATE no action ON DELETE no action
);
