CREATE TYPE "public"."standard_unit" AS ENUM('kg', 'g', 'L', 'mL', 'cup', 'tbsp', 'tsp', 'fl oz', 'pint', 'quart', 'gallon');--> statement-breakpoint
CREATE TABLE "ingredient_informal_units" (
	"id" serial PRIMARY KEY NOT NULL,
	"ingredient_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "informal_unit_name_unique_per_ingredient" UNIQUE("ingredient_id","name")
);
--> statement-breakpoint
CREATE TABLE "ingredients_to_recipes" (
	"recipe_id" integer NOT NULL,
	"ingredient_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"standard_unit" "standard_unit",
	"informal_unit_id" integer,
	CONSTRAINT "ingredients_to_recipes_recipe_id_ingredient_id_pk" PRIMARY KEY("recipe_id","ingredient_id")
);
--> statement-breakpoint
CREATE TABLE "recipe_favorites" (
	"user_id" integer NOT NULL,
	"recipe_id" integer NOT NULL,
	CONSTRAINT "recipe_favorites_user_id_recipe_id_pk" PRIMARY KEY("user_id","recipe_id")
);
--> statement-breakpoint
CREATE TABLE "recipe_ingredients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"density" integer NOT NULL,
	"is_solid" boolean NOT NULL,
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
	"user_id" integer NOT NULL,
	"recipe_id" integer NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recipe_utensils" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "recipe_utensils_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"duration" integer NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"author_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "duration_check" CHECK ("recipes"."duration" > 0)
);
--> statement-breakpoint
CREATE TABLE "utensils_to_recipes" (
	"recipe_id" integer NOT NULL,
	"utensil_id" integer NOT NULL,
	CONSTRAINT "utensils_to_recipes_recipe_id_utensil_id_pk" PRIMARY KEY("recipe_id","utensil_id")
);
--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "last_verified_at" TO "last_validated_at";--> statement-breakpoint
ALTER TABLE "ingredient_informal_units" ADD CONSTRAINT "ingredient_informal_units_ingredient_id_recipe_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."recipe_ingredients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredients_to_recipes" ADD CONSTRAINT "ingredients_to_recipes_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredients_to_recipes" ADD CONSTRAINT "ingredients_to_recipes_ingredient_id_recipe_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."recipe_ingredients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ingredients_to_recipes" ADD CONSTRAINT "ingredients_to_recipes_informal_unit_id_ingredient_informal_units_id_fk" FOREIGN KEY ("informal_unit_id") REFERENCES "public"."ingredient_informal_units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_favorites" ADD CONSTRAINT "recipe_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_favorites" ADD CONSTRAINT "recipe_favorites_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_instructions" ADD CONSTRAINT "recipe_instructions_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_notes" ADD CONSTRAINT "recipe_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_notes" ADD CONSTRAINT "recipe_notes_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utensils_to_recipes" ADD CONSTRAINT "utensils_to_recipes_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utensils_to_recipes" ADD CONSTRAINT "utensils_to_recipes_utensil_id_recipe_utensils_id_fk" FOREIGN KEY ("utensil_id") REFERENCES "public"."recipe_utensils"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "verification_id";