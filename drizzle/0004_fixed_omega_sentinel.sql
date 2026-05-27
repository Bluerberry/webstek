CREATE TYPE "public"."recipe_ingredient_unit_type" AS ENUM('volume', 'weight', 'custom');--> statement-breakpoint
CREATE TABLE "join_recipe_ingredients" (
	"recipe_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	"quantity" numeric(10, 3) NOT NULL,
	"unit_type" "recipe_ingredient_unit_type" NOT NULL,
	"custom_unit_name" varchar(256),
	CONSTRAINT "join_recipe_ingredients_recipe_id_ingredient_id_pk" PRIMARY KEY("recipe_id","ingredient_id"),
	CONSTRAINT "custom_unit_name_required" CHECK (
        (unit_type = 'custom' AND custom_unit_name IS NOT NULL)
        OR
        (unit_type != 'custom' AND custom_unit_name IS NULL)
    )
);
--> statement-breakpoint
CREATE TABLE "join_recipe_tags" (
	"recipe_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "join_recipe_tags_recipe_id_tag_id_pk" PRIMARY KEY("recipe_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "join_recipe_utensils" (
	"recipe_id" integer NOT NULL,
	"utensil_id" integer NOT NULL,
	CONSTRAINT "join_recipe_utensils_recipe_id_utensil_id_pk" PRIMARY KEY("recipe_id","utensil_id")
);
--> statement-breakpoint
CREATE TABLE "recipe_ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"density" real,
	CONSTRAINT "recipe_ingredients_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "recipe_instructions" (
	"recipe_id" integer NOT NULL,
	"index" integer NOT NULL,
	"text" text NOT NULL,
	CONSTRAINT "recipe_instructions_recipe_id_index_pk" PRIMARY KEY("recipe_id","index")
);
--> statement-breakpoint
CREATE TABLE "recipe_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipe_id" integer NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"tag" varchar(256) NOT NULL,
	CONSTRAINT "recipe_tags_tag_unique" UNIQUE("tag")
);
--> statement-breakpoint
CREATE TABLE "recipe_utensils" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	CONSTRAINT "recipe_utensils_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" integer,
	"parent_id" integer,
	"duration" integer NOT NULL,
	"portions" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_verifications" ALTER COLUMN "code" SET DATA TYPE varchar(8);--> statement-breakpoint
ALTER TABLE "password_resets" ALTER COLUMN "code" SET DATA TYPE varchar(8);--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "country" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "browser_name" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "browser_version" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "join_recipe_ingredients" ADD CONSTRAINT "join_recipe_ingredients_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "join_recipe_ingredients" ADD CONSTRAINT "join_recipe_ingredients_ingredient_id_recipe_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."recipe_ingredients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "join_recipe_tags" ADD CONSTRAINT "join_recipe_tags_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "join_recipe_tags" ADD CONSTRAINT "join_recipe_tags_tag_id_recipe_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."recipe_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "join_recipe_utensils" ADD CONSTRAINT "join_recipe_utensils_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "join_recipe_utensils" ADD CONSTRAINT "join_recipe_utensils_utensil_id_recipe_utensils_id_fk" FOREIGN KEY ("utensil_id") REFERENCES "public"."recipe_utensils"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_instructions" ADD CONSTRAINT "recipe_instructions_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_notes" ADD CONSTRAINT "recipe_notes_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;