ALTER TABLE "ucbIngredients" RENAME TO "ucb_ingredients";--> statement-breakpoint
ALTER TABLE "ucb_ingredients" DROP CONSTRAINT "ucbIngredients_name_unique";--> statement-breakpoint
ALTER TABLE "ucb_join_recipe_ingredients" DROP CONSTRAINT "ucb_join_recipe_ingredients_ingredient_id_ucbIngredients_id_fk";
--> statement-breakpoint
ALTER TABLE "ucb_join_recipe_ingredients" ADD CONSTRAINT "ucb_join_recipe_ingredients_ingredient_id_ucb_ingredients_id_fk" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ucb_ingredients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ucb_ingredients" ADD CONSTRAINT "ucb_ingredients_name_unique" UNIQUE("name");