CREATE TABLE "cv_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"preview_image" text,
	"is_active" boolean DEFAULT true,
	"template_data" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "cv_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cvs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"template" text DEFAULT 'ats' NOT NULL,
	"data" text NOT NULL,
	"file_name" text,
	"file_url" text,
	"is_public" boolean DEFAULT false,
	"user_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
