CREATE TABLE "active_visitors" (
	"session_id" text PRIMARY KEY NOT NULL,
	"user_id" integer,
	"current_page" text,
	"ip" text,
	"country" text,
	"city" text,
	"device" text,
	"browser" text,
	"source" text,
	"last_seen" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "api_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text,
	"user_id" integer,
	"method" text NOT NULL,
	"path" text NOT NULL,
	"status_code" integer NOT NULL,
	"response_time" integer,
	"user_agent" text,
	"ip" text,
	"referer" text,
	"error_message" text,
	"request_size" integer,
	"response_size" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "blog_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#3b82f6',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "blog_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "blog_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"featured_image" text,
	"image_credit" text,
	"author_id" integer NOT NULL,
	"category_id" integer,
	"tags" text,
	"meta_title" text,
	"meta_description" text,
	"meta_keywords" text,
	"is_published" boolean DEFAULT false,
	"published_at" timestamp,
	"view_count" integer DEFAULT 0,
	"reading_time" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "checklists" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"content" text NOT NULL,
	"is_done" boolean DEFAULT false,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"company" text,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"country" text,
	"website" text,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text,
	"message" text NOT NULL,
	"phone" text,
	"company" text,
	"is_read" boolean DEFAULT false,
	"is_replied" boolean DEFAULT false,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"total_sessions" integer DEFAULT 0,
	"total_page_views" integer DEFAULT 0,
	"total_api_requests" integer DEFAULT 0,
	"unique_visitors" integer DEFAULT 0,
	"desktop_sessions" integer DEFAULT 0,
	"mobile_sessions" integer DEFAULT 0,
	"tablet_sessions" integer DEFAULT 0,
	"bounce_rate" real DEFAULT 0,
	"avg_session_duration" real DEFAULT 0,
	"avg_page_views" real DEFAULT 0,
	"top_page" text,
	"top_source" text,
	"top_country" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "daily_stats_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE "document_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"is_internal" boolean DEFAULT true,
	"parent_comment_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_revisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"revision_number" integer NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"changes" text,
	"revised_by" integer NOT NULL,
	"file_path" text,
	"file_name" text,
	"file_size" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_signatures" (
	"id" serial PRIMARY KEY NOT NULL,
	"document_id" integer NOT NULL,
	"signer_name" text NOT NULL,
	"signer_email" text NOT NULL,
	"signer_role" text,
	"signature_data" text,
	"signed_at" timestamp,
	"ip_address" text,
	"user_agent" text,
	"is_signed" boolean DEFAULT false,
	"signature_order" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_signers" (
	"id" serial PRIMARY KEY NOT NULL,
	"signing_request_id" integer NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'Signer',
	"status" text DEFAULT 'pending',
	"signed_at" timestamp,
	"declined_at" timestamp,
	"decline_reason" text,
	"signature_data" text,
	"signature_type" text,
	"ip_address" text,
	"user_agent" text,
	"access_token" text NOT NULL,
	"accessed_at" timestamp,
	"access_count" integer DEFAULT 0,
	"signing_order" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "document_signers_access_token_unique" UNIQUE("access_token")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"internal_number" integer NOT NULL,
	"document_number" text,
	"title" text NOT NULL,
	"description" text,
	"content" text,
	"type" text NOT NULL,
	"status" text DEFAULT 'DRAFT',
	"priority" text DEFAULT 'MEDIUM',
	"project_id" integer,
	"client_id" integer,
	"user_id" integer NOT NULL,
	"version" text DEFAULT '1.0',
	"category" text,
	"tags" text,
	"file_path" text,
	"file_name" text,
	"file_size" integer,
	"file_type" text,
	"start_date" text,
	"end_date" text,
	"signed_date" text,
	"expiry_date" text,
	"reminder_date" text,
	"contract_value" real,
	"currency" text DEFAULT 'USD',
	"approval_required" boolean DEFAULT false,
	"approved_by" integer,
	"approved_at" timestamp,
	"is_template" boolean DEFAULT false,
	"parent_document_id" integer,
	"is_active" boolean DEFAULT true,
	"is_confidential" boolean DEFAULT false,
	"last_accessed_at" timestamp,
	"access_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"email_id" integer NOT NULL,
	"file_name" text NOT NULL,
	"original_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer,
	"mime_type" text NOT NULL,
	"content_id" text,
	"is_inline" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"to" text NOT NULL,
	"cc" text,
	"bcc" text,
	"subject" text NOT NULL,
	"text_content" text,
	"html_content" text,
	"attachments" text,
	"reply_to_email_id" integer,
	"forward_email_id" integer,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_labels" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#3b82f6',
	"is_system" boolean DEFAULT false,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "email_labels_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "email_provider_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"provider" text NOT NULL,
	"is_active" boolean DEFAULT false,
	"settings" text NOT NULL,
	"from_email" text NOT NULL,
	"from_name" text,
	"reply_to_email" text,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "emails" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" text,
	"thread_id" text,
	"from" text NOT NULL,
	"from_name" text,
	"to" text NOT NULL,
	"cc" text,
	"bcc" text,
	"reply_to" text,
	"subject" text NOT NULL,
	"text_content" text,
	"html_content" text,
	"preview" text,
	"folder" text DEFAULT 'inbox',
	"is_read" boolean DEFAULT false,
	"is_starred" boolean DEFAULT false,
	"is_important" boolean DEFAULT false,
	"is_draft" boolean DEFAULT false,
	"labels" text,
	"category" text,
	"provider_data" text,
	"delivery_status" text,
	"sent_at" timestamp,
	"received_at" timestamp,
	"has_attachments" boolean DEFAULT false,
	"attachment_count" integer DEFAULT 0,
	"in_reply_to" text,
	"references" text,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "emails_message_id_unique" UNIQUE("message_id")
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"date" text NOT NULL,
	"title" text NOT NULL,
	"category" text,
	"amount" real NOT NULL,
	"currency" text DEFAULT 'USD',
	"tax_amount" real DEFAULT 0,
	"receipt_url" text,
	"description" text,
	"billable" boolean DEFAULT true,
	"reimbursed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoice_line_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"description" text NOT NULL,
	"quantity" real DEFAULT 1,
	"unit_price" real NOT NULL,
	"total_price" real NOT NULL,
	"order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"client_id" integer NOT NULL,
	"invoice_number" text NOT NULL,
	"date_issued" text NOT NULL,
	"due_date" text,
	"subtotal" real NOT NULL,
	"tax_rate" real DEFAULT 0,
	"tax_amount" real DEFAULT 0,
	"total_amount" real NOT NULL,
	"paid_amount" real DEFAULT 0,
	"currency" text DEFAULT 'USD',
	"status" text DEFAULT 'DRAFT',
	"notes" text,
	"terms" text,
	"invoice_url" text,
	"sent_at" timestamp,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "media_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_name" text NOT NULL,
	"original_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer,
	"file_type" text NOT NULL,
	"mime_type" text NOT NULL,
	"width" integer,
	"height" integer,
	"alt_text" text,
	"caption" text,
	"uploaded_by_id" integer NOT NULL,
	"folder" text DEFAULT 'uploads',
	"is_public" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"user_id" integer,
	"path" text NOT NULL,
	"title" text,
	"referrer" text,
	"user_agent" text,
	"ip" text,
	"country" text,
	"city" text,
	"device" text,
	"browser" text,
	"os" text,
	"source" text,
	"medium" text,
	"campaign" text,
	"duration" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"meta_title" text,
	"meta_description" text,
	"meta_keywords" text,
	"is_published" boolean DEFAULT false,
	"published_at" timestamp,
	"featured_image" text,
	"template" text DEFAULT 'default',
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"date" text NOT NULL,
	"amount" real NOT NULL,
	"currency" text DEFAULT 'USD',
	"method" text,
	"transaction_id" text,
	"transfer_proof_url" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "portfolio_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" text,
	"featured_image" text,
	"gallery" text,
	"technologies" text,
	"project_url" text,
	"github_url" text,
	"category" text,
	"is_published" boolean DEFAULT false,
	"published_at" timestamp,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"task_id" integer,
	"author_id" integer NOT NULL,
	"content" text NOT NULL,
	"is_internal" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"task_id" integer,
	"uploaded_by_id" integer NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer,
	"file_type" text,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"client_id" integer,
	"user_id" integer NOT NULL,
	"status" text DEFAULT 'PLANNING',
	"priority" text DEFAULT 'MEDIUM',
	"start_date" text NOT NULL,
	"deadline" text,
	"completed_at" timestamp,
	"tags" text,
	"color" text DEFAULT '#3b82f6',
	"project_value" real,
	"currency" text DEFAULT 'USD',
	"tax_rate" real DEFAULT 0,
	"tax_amount" real DEFAULT 0,
	"progress_percentage" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "qr_code_scans" (
	"id" serial PRIMARY KEY NOT NULL,
	"qr_code_id" integer NOT NULL,
	"ip" text,
	"user_agent" text,
	"country" text,
	"city" text,
	"device" text,
	"browser" text,
	"os" text,
	"scanned_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "qr_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"data" text NOT NULL,
	"size" integer DEFAULT 256,
	"foreground_color" text DEFAULT '#000000',
	"background_color" text DEFAULT '#ffffff',
	"error_correction_level" text DEFAULT 'M',
	"qr_code_url" text NOT NULL,
	"format" text DEFAULT 'png',
	"scans" integer DEFAULT 0,
	"last_scanned_at" timestamp,
	"shortened_url_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer,
	"ip" text,
	"user_agent" text,
	"country" text,
	"city" text,
	"device" text,
	"browser" text,
	"os" text,
	"source" text,
	"medium" text,
	"campaign" text,
	"landing_page" text,
	"exit_page" text,
	"page_count" integer DEFAULT 1,
	"duration" integer,
	"bounced" boolean DEFAULT false,
	"converted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "shortened_urls" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"original_url" text NOT NULL,
	"short_code" text NOT NULL,
	"custom_alias" text,
	"description" text,
	"clicks" integer DEFAULT 0,
	"unique_clicks" integer DEFAULT 0,
	"last_clicked_at" timestamp,
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"password" text,
	"qr_code_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "shortened_urls_short_code_unique" UNIQUE("short_code"),
	CONSTRAINT "shortened_urls_custom_alias_unique" UNIQUE("custom_alias")
);
--> statement-breakpoint
CREATE TABLE "signing_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"signing_request_id" integer NOT NULL,
	"signer_id" integer,
	"event_type" text NOT NULL,
	"event_data" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "signing_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"document_name" text NOT NULL,
	"document_url" text NOT NULL,
	"document_size" integer,
	"document_type" text,
	"title" text NOT NULL,
	"message" text,
	"status" text DEFAULT 'draft',
	"expires_at" timestamp NOT NULL,
	"reminder_enabled" boolean DEFAULT true,
	"reminder_days" integer DEFAULT 3,
	"signing_order" text DEFAULT 'parallel',
	"requires_all_signatures" boolean DEFAULT true,
	"sent_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text,
	"type" text DEFAULT 'text',
	"group" text DEFAULT 'general',
	"label" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "site_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"assigned_to_id" integer,
	"title" text NOT NULL,
	"description" text,
	"priority" text DEFAULT 'MEDIUM',
	"status" text DEFAULT 'TODO',
	"due_date" text,
	"estimated_hours" real,
	"actual_hours" real DEFAULT 0,
	"order" integer DEFAULT 0,
	"tags" text,
	"parent_task_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "time_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"date" text NOT NULL,
	"start_time" text,
	"end_time" text,
	"hours_spent" real NOT NULL,
	"description" text,
	"billable" boolean DEFAULT true,
	"hourly_rate" real,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "url_clicks" (
	"id" serial PRIMARY KEY NOT NULL,
	"shortened_url_id" integer NOT NULL,
	"ip" text,
	"user_agent" text,
	"referer" text,
	"country" text,
	"city" text,
	"device" text,
	"browser" text,
	"os" text,
	"clicked_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"username" text,
	"avatar" text,
	"bio" text,
	"phone" text,
	"date_of_birth" text,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"country" text,
	"company" text,
	"job_title" text,
	"website" text,
	"is_active" boolean DEFAULT true,
	"email_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "active_visitors" ADD CONSTRAINT "active_visitors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_requests" ADD CONSTRAINT "api_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_category_id_blog_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."blog_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklists" ADD CONSTRAINT "checklists_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_comments" ADD CONSTRAINT "document_comments_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_comments" ADD CONSTRAINT "document_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_comments" ADD CONSTRAINT "document_comments_parent_comment_id_document_comments_id_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."document_comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_revisions" ADD CONSTRAINT "document_revisions_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_revisions" ADD CONSTRAINT "document_revisions_revised_by_users_id_fk" FOREIGN KEY ("revised_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_signatures" ADD CONSTRAINT "document_signatures_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_signers" ADD CONSTRAINT "document_signers_signing_request_id_signing_requests_id_fk" FOREIGN KEY ("signing_request_id") REFERENCES "public"."signing_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_parent_document_id_documents_id_fk" FOREIGN KEY ("parent_document_id") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_attachments" ADD CONSTRAINT "email_attachments_email_id_emails_id_fk" FOREIGN KEY ("email_id") REFERENCES "public"."emails"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_drafts" ADD CONSTRAINT "email_drafts_reply_to_email_id_emails_id_fk" FOREIGN KEY ("reply_to_email_id") REFERENCES "public"."emails"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_drafts" ADD CONSTRAINT "email_drafts_forward_email_id_emails_id_fk" FOREIGN KEY ("forward_email_id") REFERENCES "public"."emails"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_drafts" ADD CONSTRAINT "email_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_labels" ADD CONSTRAINT "email_labels_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_provider_settings" ADD CONSTRAINT "email_provider_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "emails_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_line_items" ADD CONSTRAINT "invoice_line_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_comments" ADD CONSTRAINT "project_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_files" ADD CONSTRAINT "project_files_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_files" ADD CONSTRAINT "project_files_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_files" ADD CONSTRAINT "project_files_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_code_scans" ADD CONSTRAINT "qr_code_scans_qr_code_id_qr_codes_id_fk" FOREIGN KEY ("qr_code_id") REFERENCES "public"."qr_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_shortened_url_id_shortened_urls_id_fk" FOREIGN KEY ("shortened_url_id") REFERENCES "public"."shortened_urls"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shortened_urls" ADD CONSTRAINT "shortened_urls_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signing_events" ADD CONSTRAINT "signing_events_signing_request_id_signing_requests_id_fk" FOREIGN KEY ("signing_request_id") REFERENCES "public"."signing_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signing_events" ADD CONSTRAINT "signing_events_signer_id_document_signers_id_fk" FOREIGN KEY ("signer_id") REFERENCES "public"."document_signers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signing_requests" ADD CONSTRAINT "signing_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_logs" ADD CONSTRAINT "time_logs_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_logs" ADD CONSTRAINT "time_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "url_clicks" ADD CONSTRAINT "url_clicks_shortened_url_id_shortened_urls_id_fk" FOREIGN KEY ("shortened_url_id") REFERENCES "public"."shortened_urls"("id") ON DELETE no action ON UPDATE no action;