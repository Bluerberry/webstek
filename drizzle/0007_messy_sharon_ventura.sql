ALTER TYPE "public"."recipe_ingredient_unit_type" RENAME TO "ucb_ingredient_unit_type";--> statement-breakpoint
ALTER TABLE "recipe_ingredients" RENAME TO "ucbIngredients";--> statement-breakpoint
ALTER TABLE "recipe_instructions" RENAME TO "ucb_instructions";--> statement-breakpoint
ALTER TABLE "join_recipe_ingredients" RENAME TO "ucb_join_recipe_ingredients";--> statement-breakpoint
ALTER TABLE "join_recipe_tags" RENAME TO "ucb_join_recipe_tags";--> statement-breakpoint
ALTER TABLE "join_recipe_utensils" RENAME TO "ucb_join_recipe_utensils";--> statement-breakpoint
ALTER TABLE "recipe_notes" RENAME TO "ucb_notes";--> statement-breakpoint
ALTER TABLE "recipes" RENAME TO "ucb_recipes";--> statement-breakpoint
ALTER TABLE "recipe_tags" RENAME TO "ucb_tags";--> statement-breakpoint
ALTER TABLE "recipe_utensils" RENAME TO "ucb_utensils";--> statement-breakpoint
ALTER TABLE "ucb_tags" RENAME COLUMN "tag" TO "name";--> statement-breakpoint
ALTER TABLE "ucbIngredients" DROP CONSTRAINT "recipe_ingredients_name_unique";--> statement-breakpoint
ALTER TABLE "ucb_tags" DROP CONSTRAINT "recipe_tags_tag_unique";--> statement-breakpoint
ALTER TABLE "ucb_utensils" DROP CONSTRAINT "recipe_utensils_name_unique";--> statement-breakpoint
ALTER TABLE "ucb_join_recipe_ingredients" DROP CONSTRAINT "join_recipe_ingredients_recipe_id_recipes_id_fk";
--> statement-breakpoint
ALTER TABLE "ucb_join_recipe_ingredients" DROP CONSTRAINT "join_recipe_ingredients_ingredient_id_recipe_ingredients_id_fk";
--> statement-breakpoint
ALTER TABLE "ucb_join_recipe_tags" DROP CONSTRAINT "join_recipe_tags_recipe_id_recipes_id_fk";
--> statement-breakpoint
ALTER TABLE "ucb_join_recipe_tags" DROP CONSTRAINT "join_recipe_tags_tag_id_recipe_tags_id_fk";
--> statement-breakpoint
ALTER TABLE "ucb_join_recipe_utensils" DROP CONSTRAINT "join_recipe_utensils_recipe_id_recipes_id_fk";
--> statement-breakpoint
ALTER TABLE "ucb_join_recipe_utensils" DROP CONSTRAINT "join_recipe_utensils_utensil_id_recipe_utensils_id_fk";
--> statement-breakpoint
ALTER TABLE "ucb_instructions" DROP CONSTRAINT "recipe_instructions_recipe_id_recipes_id_fk";
--> statement-breakpoint
ALTER TABLE "ucb_notes" DROP CONSTRAINT "recipe_notes_recipe_id_recipes_id_fk";
--> statement-breakpoint
ALTER TABLE "ucb_recipes" DROP CONSTRAINT "recipes_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "ucb_recipes" DROP CONSTRAINT "recipes_parent_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "ucb_join_recipe_ingredients" DROP CONSTRAINT "join_recipe_ingredients_recipe_id_ingredient_id_pk";--> statement-breakpoint
ALTER TABLE "ucb_join_recipe_tags" DROP CONSTRAINT "join_recipe_tags_recipe_id_tag_id_pk";--> statement-breakpoint
ALTER TABLE "ucb_join_recipe_utensils" DROP CONSTRAINT "join_recipe_utensils_recipe_id_utensil_id_pk";--> statement-breakpoint
ALTER TABLE "ucb_instructions" DROP CONSTRAINT "recipe_instructions_recipe_id_index_pk";--> statement-breakpoint
ALTER TABLE "ucb_join_recipe_ingredients" ADD CONSTRAINT "ucb_join_recipe_ingredients_recipe_id_ingredient_id_pk" PRIMARY KEY("recipe_id","ingredient_id");--> statement-breakpoint
ALTER TABLE "ucb_join_recipe_tags" ADD CONSTRAINT "ucb_join_recipe_tags_recipe_id_tag_id_pk" PRIMARY KEY("recipe_id","tag_id");--> statement-breakpoint
ALTER TABLE "ucb_join_recipe_utensils" ADD CONSTRAINT "ucb_join_recipe_utensils_recipe_id_utensil_id_pk" PRIMARY KEY("recipe_id","utensil_id");--> statement-breakpoint
ALTER TABLE "ucb_instructions" ADD CONSTRAINT "ucb_instructions_recipe_id_index_pk" PRIMARY KEY("recipe_id","index");--> statement-breakpoint
ALTER TABLE "ucb_join_recipe_ingredients" ADD CONSTRAINT "ucb_join_recipe_ingredients_recipe_id_ucb_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."ucb_recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ucb_join_recipe_ingredients" ADD CONSTRAINT "ucb_join_recipe_ingredients_ingredient_id_ucbIngredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ucbIngredients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ucb_join_recipe_tags" ADD CONSTRAINT "ucb_join_recipe_tags_recipe_id_ucb_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."ucb_recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ucb_join_recipe_tags" ADD CONSTRAINT "ucb_join_recipe_tags_tag_id_ucb_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."ucb_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ucb_join_recipe_utensils" ADD CONSTRAINT "ucb_join_recipe_utensils_recipe_id_ucb_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."ucb_recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ucb_join_recipe_utensils" ADD CONSTRAINT "ucb_join_recipe_utensils_utensil_id_ucb_utensils_id_fk" FOREIGN KEY ("utensil_id") REFERENCES "public"."ucb_utensils"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ucb_instructions" ADD CONSTRAINT "ucb_instructions_recipe_id_ucb_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."ucb_recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ucb_notes" ADD CONSTRAINT "ucb_notes_recipe_id_ucb_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."ucb_recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ucb_recipes" ADD CONSTRAINT "ucb_recipes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ucb_recipes" ADD CONSTRAINT "ucb_recipes_parent_id_users_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ucbIngredients" ADD CONSTRAINT "ucbIngredients_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "ucb_tags" ADD CONSTRAINT "ucb_tags_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "ucb_utensils" ADD CONSTRAINT "ucb_utensils_name_unique" UNIQUE("name");