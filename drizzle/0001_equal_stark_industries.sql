CREATE TABLE `blog_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`color` text DEFAULT '#3b82f6',
	`is_active` integer DEFAULT true,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_categories_name_unique` ON `blog_categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `blog_categories_slug_unique` ON `blog_categories` (`slug`);--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text,
	`content` text NOT NULL,
	`featured_image` text,
	`author_id` integer NOT NULL,
	`category_id` integer,
	`tags` text,
	`meta_title` text,
	`meta_description` text,
	`meta_keywords` text,
	`is_published` integer DEFAULT false,
	`published_at` text,
	`view_count` integer DEFAULT 0,
	`reading_time` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `blog_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_posts_slug_unique` ON `blog_posts` (`slug`);--> statement-breakpoint
CREATE TABLE `contact_submissions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`subject` text,
	`message` text NOT NULL,
	`phone` text,
	`company` text,
	`is_read` integer DEFAULT false,
	`is_replied` integer DEFAULT false,
	`ip_address` text,
	`user_agent` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `document_comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`content` text NOT NULL,
	`is_internal` integer DEFAULT true,
	`parent_comment_id` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parent_comment_id`) REFERENCES `document_comments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `document_revisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` integer NOT NULL,
	`revision_number` integer NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`changes` text,
	`revised_by` integer NOT NULL,
	`file_path` text,
	`file_name` text,
	`file_size` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`revised_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `document_signatures` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`document_id` integer NOT NULL,
	`signer_name` text NOT NULL,
	`signer_email` text NOT NULL,
	`signer_role` text,
	`signature_data` text,
	`signed_at` text,
	`ip_address` text,
	`user_agent` text,
	`is_signed` integer DEFAULT false,
	`signature_order` integer DEFAULT 1,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`internal_number` integer NOT NULL,
	`document_number` text,
	`title` text NOT NULL,
	`description` text,
	`content` text,
	`type` text NOT NULL,
	`status` text DEFAULT 'DRAFT',
	`priority` text DEFAULT 'MEDIUM',
	`project_id` integer,
	`client_id` integer,
	`user_id` integer NOT NULL,
	`version` text DEFAULT '1.0',
	`category` text,
	`tags` text,
	`file_path` text,
	`file_name` text,
	`file_size` integer,
	`file_type` text,
	`start_date` text,
	`end_date` text,
	`signed_date` text,
	`expiry_date` text,
	`reminder_date` text,
	`contract_value` real,
	`currency` text DEFAULT 'USD',
	`approval_required` integer DEFAULT false,
	`approved_by` integer,
	`approved_at` text,
	`is_template` integer DEFAULT false,
	`parent_document_id` integer,
	`is_active` integer DEFAULT true,
	`is_confidential` integer DEFAULT false,
	`last_accessed_at` text,
	`access_count` integer DEFAULT 0,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parent_document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `media_files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`file_name` text NOT NULL,
	`original_name` text NOT NULL,
	`file_url` text NOT NULL,
	`file_size` integer,
	`file_type` text NOT NULL,
	`mime_type` text NOT NULL,
	`width` integer,
	`height` integer,
	`alt_text` text,
	`caption` text,
	`uploaded_by_id` integer NOT NULL,
	`folder` text DEFAULT 'uploads',
	`is_public` integer DEFAULT true,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`uploaded_by_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`meta_title` text,
	`meta_description` text,
	`meta_keywords` text,
	`is_published` integer DEFAULT false,
	`published_at` text,
	`featured_image` text,
	`template` text DEFAULT 'default',
	`order` integer DEFAULT 0,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pages_slug_unique` ON `pages` (`slug`);--> statement-breakpoint
CREATE TABLE `portfolio_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`content` text,
	`featured_image` text,
	`gallery` text,
	`technologies` text,
	`project_url` text,
	`github_url` text,
	`category` text,
	`is_published` integer DEFAULT false,
	`published_at` text,
	`order` integer DEFAULT 0,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text,
	`type` text DEFAULT 'text',
	`group` text DEFAULT 'general',
	`label` text NOT NULL,
	`description` text,
	`order` integer DEFAULT 0,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `site_settings_key_unique` ON `site_settings` (`key`);