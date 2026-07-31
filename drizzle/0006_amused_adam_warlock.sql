ALTER TABLE "recipes" ALTER COLUMN "duration" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "portions" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "title" varchar(64);--> statement-breakpoint
ALTER TABLE "recipes" ADD COLUMN "description" text;