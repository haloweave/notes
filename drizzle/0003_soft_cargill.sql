CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"status" varchar(50) NOT NULL,
	"credits" integer NOT NULL,
	"stripe_session_id" text,
	"package_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_stripe_session_id_unique" UNIQUE("stripe_session_id")
);
--> statement-breakpoint
ALTER TABLE "music_generations" ADD COLUMN "share_slug_v1" text;--> statement-breakpoint
ALTER TABLE "music_generations" ADD COLUMN "share_slug_v2" text;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "music_generations" ADD CONSTRAINT "music_generations_share_slug_v1_unique" UNIQUE("share_slug_v1");--> statement-breakpoint
ALTER TABLE "music_generations" ADD CONSTRAINT "music_generations_share_slug_v2_unique" UNIQUE("share_slug_v2");