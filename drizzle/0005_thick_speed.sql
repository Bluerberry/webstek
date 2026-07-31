ALTER TABLE "email_verifications" ALTER COLUMN "code" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "password_resets" ALTER COLUMN "code" SET DATA TYPE varchar(256);