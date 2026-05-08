CREATE TYPE "public"."request_type" AS ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH');--> statement-breakpoint
CREATE TABLE "deleted_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "request_type" NOT NULL,
	"path" varchar NOT NULL,
	"response_time" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
