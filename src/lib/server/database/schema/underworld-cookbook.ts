
import { sql, relations } from 'drizzle-orm'
import { pgTable, primaryKey, serial, varchar, integer, timestamp, boolean, text, pgEnum, check, unique } from 'drizzle-orm/pg-core'
import { users } from '../schema'

export const standardUnitEnum = pgEnum('standard_unit', ['kg', 'g', 'L', 'mL', 'cup', 'tbsp', 'tsp', 'fl oz', 'pint', 'quart', 'gallon'])

export const recipes = pgTable('recipes', {
		id: serial('id')
			.primaryKey(),
		name: varchar('name', { length: 255 })
			.notNull(),
		duration: integer('duration')
			.notNull(),
		isPublic: boolean('is_public')
			.notNull()
			.default(false),
		authorId: integer('author_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		updatedAt: timestamp('updated_at')
			.notNull()
			.defaultNow()
	},
	table => [
		check('duration_check', sql`${table.duration} > 0`)
	]
)

export const recipeRelations = relations(recipes, ({ many, one }) => ({
	utensilsToRecipes: many(utensilsToRecipes),
	ingredientsToRecipes: many(ingredientsToRecipes),
	instructions: many(recipeInstructions),
	favorites: many(recipeFavorites),
	notes: many(recipeNotes),
	author: one(users, {
		fields: [recipes.authorId],
		references: [users.id]
	})
}))

export const recipeUtensils = pgTable('recipe_utensils', {
	id: serial('id')
		.primaryKey(),
	name: varchar('name', { length: 255 })
		.notNull()
		.unique()
})

export const recipeUtensilRelations = relations(recipeUtensils, ({ many }) => ({
	utensilsToRecipes: many(utensilsToRecipes)
}))

export const utensilsToRecipes = pgTable('utensils_to_recipes', {
		recipeId: integer('recipe_id')
			.notNull()
			.references(() => recipes.id, { onDelete: 'cascade' }),
		utensilId: integer('utensil_id')
			.notNull()
			.references(() => recipeUtensils.id, { onDelete: 'cascade' })
	},
	table => [
		primaryKey({ columns: [table.recipeId, table.utensilId] })
	]
)

export const utensilToRecipeRelations = relations(utensilsToRecipes, ({ one }) => ({
	recipe: one(recipes, {
		fields: [utensilsToRecipes.recipeId],
		references: [recipes.id]
	}),
	utensil: one(recipeUtensils, {
		fields: [utensilsToRecipes.utensilId],
		references: [recipeUtensils.id]
	})
}))

export const recipeIngredients = pgTable('recipe_ingredients', {
	id: serial('id')
		.primaryKey(),
	name: varchar('name', { length: 255 })
		.notNull()
		.unique(),
	density: integer('density')
		.notNull(),
	isSolid: boolean('is_solid')
		.notNull()
})

export const recipeIngredientRelations = relations(recipeIngredients, ({ many }) => ({
	ingredientsToRecipes: many(ingredientsToRecipes),
	informalUnits: many(ingredientInformalUnits)
}))

export const ingredientInformalUnits = pgTable('ingredient_informal_units', {
		id: serial('id')
			.primaryKey(),
		ingredientId: integer('ingredient_id')
			.notNull()
			.references(() => recipeIngredients.id, { onDelete: 'cascade' }),
		name: varchar('name', { length: 255 })
			.notNull(),
	},
	table => [
		unique('informal_unit_name_unique_per_ingredient').on(
	 		table.ingredientId,
	  		table.name
		)
	]
)

export const ingredientInformalUnitRelations = relations(ingredientInformalUnits, ({ one }) => ({
	ingredient: one(recipeIngredients, {
		fields: [ingredientInformalUnits.ingredientId],
		references: [recipeIngredients.id]
	})
}))

export const ingredientsToRecipes = pgTable('ingredients_to_recipes', {
		recipeId: integer('recipe_id')
			.notNull()
			.references(() => recipes.id, { onDelete: 'cascade' }),
		ingredientId: integer('ingredient_id')
			.notNull()
			.references(() => recipeIngredients.id, { onDelete: 'cascade' }),
		amount: integer('amount')
			.notNull(),
		standardUnit: standardUnitEnum('standard_unit'),
		informalUnitId: integer('informal_unit_id')
			.references(() => ingredientInformalUnits.id, { onDelete: 'cascade'})
	},
	table => [
		primaryKey({ columns: [table.recipeId, table.ingredientId] })
	]
)

export const ingredientToRecipeRelations = relations(ingredientsToRecipes, ({ one }) => ({
	recipe: one(recipes, {
		fields: [ingredientsToRecipes.recipeId],
		references: [recipes.id]
	}),
	ingredient: one(recipeIngredients, {
		fields: [ingredientsToRecipes.ingredientId],
		references: [recipeIngredients.id]
	}),
	informalUnit: one(ingredientInformalUnits, {
		fields: [ingredientsToRecipes.informalUnitId],
		references: [ingredientInformalUnits.id]
	})
}))

export const recipeInstructions = pgTable('recipe_instructions', {
		recipeId: integer('recipe_id')
			.notNull()
			.references(() => recipes.id, { onDelete: 'cascade' }),
		index: integer('index')
			.notNull(),
		text: text('text')
			.notNull()
	},
	table => [
		primaryKey({ columns: [table.recipeId, table.index] })
	]
)

export const recipeInstructionRelations = relations(recipeInstructions, ({ one }) => ({
	recipe: one(recipes, {
		fields: [recipeInstructions.recipeId],
		references: [recipes.id]
	})
}))

export const recipeFavorites = pgTable('recipe_favorites', {
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	recipeId: integer('recipe_id')
		.notNull()
		.references(() => recipes.id, { onDelete: 'cascade' })
	},
	table => [
		primaryKey({ columns: [table.userId, table.recipeId] })
	]
)

export const recipeFavoriteRelations = relations(recipeFavorites, ({ one }) => ({
	user: one(users, {
		fields: [recipeFavorites.userId],
		references: [users.id]
	}),
	recipe: one(recipes, {
		fields: [recipeFavorites.recipeId],
		references: [recipes.id]
	})
}))

export const recipeNotes = pgTable('recipe_notes', {
	id: serial('id')
		.primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	recipeId: integer('recipe_id')
		.notNull()
		.references(() => recipes.id, { onDelete: 'cascade' }),
	text: text('text')
		.notNull(),
	createdAt: timestamp('created_at')
		.notNull()
		.defaultNow()
	}
)

export const recipeNoteRelations = relations(recipeNotes, ({ one }) => ({
	user: one(users, {
		fields: [recipeNotes.userId],
		references: [users.id]
	}),
	recipe: one(recipes, {
		fields: [recipeNotes.recipeId],
		references: [recipes.id]
	})
}))
