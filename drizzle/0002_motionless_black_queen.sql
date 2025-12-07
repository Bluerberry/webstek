ALTER TABLE "session" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET NOT NULL;