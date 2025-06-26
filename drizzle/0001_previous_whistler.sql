CREATE TABLE "chat_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"message_count" integer DEFAULT 0,
	"last_message_at" timestamp,
	"is_starred" boolean DEFAULT false,
	"is_archived" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"tokens" integer,
	"model" text DEFAULT 'gemini-1.5-flash',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_date" text NOT NULL,
	"end_date" text,
	"start_time" text,
	"end_time" text,
	"all_day" boolean DEFAULT false,
	"type" text DEFAULT 'meeting',
	"status" text DEFAULT 'confirmed',
	"priority" text DEFAULT 'medium',
	"color" text DEFAULT 'blue',
	"location" text,
	"is_virtual" boolean DEFAULT false,
	"meeting_url" text,
	"attendees" text,
	"project_id" integer,
	"client_id" integer,
	"user_id" integer NOT NULL,
	"is_recurring" boolean DEFAULT false,
	"recurrence_rule" text,
	"parent_event_id" integer,
	"reminder_minutes" integer DEFAULT 15,
	"notes" text,
	"attachments" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "project_files" ADD COLUMN "comment_id" integer;--> statement-breakpoint
ALTER TABLE "chat_conversations" ADD CONSTRAINT "chat_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_chat_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_parent_event_id_events_id_fk" FOREIGN KEY ("parent_event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_files" ADD CONSTRAINT "project_files_comment_id_project_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."project_comments"("id") ON DELETE no action ON UPDATE no action;