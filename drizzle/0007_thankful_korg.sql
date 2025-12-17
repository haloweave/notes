CREATE TABLE "compose_forms" (
	"id" text PRIMARY KEY NOT NULL,
	"package_type" varchar(50) NOT NULL,
	"song_count" integer NOT NULL,
	"form_data" jsonb NOT NULL,
	"generated_prompts" jsonb NOT NULL,
	"variation_task_ids" jsonb,
	"variation_audio_urls" jsonb,
	"selected_variations" jsonb,
	"status" varchar(50) DEFAULT 'created' NOT NULL,
	"stripe_session_id" text,
	"stripe_payment_intent_id" text,
	"amount_paid" integer,
	"paid_at" timestamp,
	"user_id" text,
	"guest_email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "compose_forms" ADD CONSTRAINT "compose_forms_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "compose_forms_user_id_idx" ON "compose_forms" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "compose_forms_status_idx" ON "compose_forms" USING btree ("status");--> statement-breakpoint
CREATE INDEX "compose_forms_stripe_session_idx" ON "compose_forms" USING btree ("stripe_session_id");