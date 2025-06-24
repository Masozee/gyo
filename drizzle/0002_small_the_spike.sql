CREATE TABLE `email_attachments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email_id` integer NOT NULL,
	`file_name` text NOT NULL,
	`original_name` text NOT NULL,
	`file_url` text NOT NULL,
	`file_size` integer,
	`mime_type` text NOT NULL,
	`content_id` text,
	`is_inline` integer DEFAULT false,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`email_id`) REFERENCES `emails`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `email_drafts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`to` text NOT NULL,
	`cc` text,
	`bcc` text,
	`subject` text NOT NULL,
	`text_content` text,
	`html_content` text,
	`attachments` text,
	`reply_to_email_id` integer,
	`forward_email_id` integer,
	`user_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`reply_to_email_id`) REFERENCES `emails`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`forward_email_id`) REFERENCES `emails`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `email_labels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#3b82f6',
	`is_system` integer DEFAULT false,
	`user_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_labels_name_unique` ON `email_labels` (`name`);--> statement-breakpoint
CREATE TABLE `email_provider_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`provider` text NOT NULL,
	`is_active` integer DEFAULT false,
	`settings` text NOT NULL,
	`from_email` text NOT NULL,
	`from_name` text,
	`reply_to_email` text,
	`user_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `emails` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`message_id` text,
	`thread_id` text,
	`from` text NOT NULL,
	`from_name` text,
	`to` text NOT NULL,
	`cc` text,
	`bcc` text,
	`reply_to` text,
	`subject` text NOT NULL,
	`text_content` text,
	`html_content` text,
	`preview` text,
	`folder` text DEFAULT 'inbox',
	`is_read` integer DEFAULT false,
	`is_starred` integer DEFAULT false,
	`is_important` integer DEFAULT false,
	`is_draft` integer DEFAULT false,
	`labels` text,
	`category` text,
	`provider_data` text,
	`delivery_status` text,
	`sent_at` text,
	`received_at` text,
	`has_attachments` integer DEFAULT false,
	`attachment_count` integer DEFAULT 0,
	`in_reply_to` text,
	`references` text,
	`user_id` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `emails_message_id_unique` ON `emails` (`message_id`);--> statement-breakpoint
ALTER TABLE `blog_posts` ADD `image_credit` text;