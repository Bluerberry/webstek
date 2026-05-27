
import { users } from './user'
import { relations, sql } from 'drizzle-orm'
import { 
    pgTable, serial, integer, 
    timestamp, text, varchar, 
    real, pgEnum, primaryKey, 
    numeric, check 
} from 'drizzle-orm/pg-core'

export const recipeIngredientUnitType = pgEnum('recipe_ingredient_unit_type', ['volume', 'weight', 'custom'])

export const recipes = pgTable('recipes', {
    id: serial('id')
        .primaryKey(),
    authorId: integer('author_id')
        .references(() => users.id, { onDelete: 'set null' }),
    parentId: integer('parent_id')
        .references(() => users.id, { onDelete: 'set null' }),
    duration: integer('duration')
        .notNull(),
    portions: integer('portions')
        .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow()
})

export const recipesRelations = relations(recipes, ({ one, many }) => ({
    author: one(users, {
        fields: [recipes.authorId],
        references: [users.id]
    }),
    parent: one(recipes, {
        fields: [recipes.parentId],
        references: [recipes.id]
    }),
    likedBy: many(users, { relationName: 'liked_by' }),
    tags: many(joinRecipeTags),
    utensils: many(joinRecipeUtensils),
    ingredients: many(joinRecipeIngredients),
    instructions: many(recipeInstructions),
    notes: many(recipeNotes)
}))

export const recipeTags = pgTable('recipe_tags', {
    id: serial('id')
        .primaryKey(),
    tag: varchar('tag', { length: 256 })
        .unique()
        .notNull()
})

export const recipeTagRelations = relations(recipeTags, ({ many }) => ({
    recipes: many(joinRecipeTags)
}))

export const joinRecipeTags = pgTable('join_recipe_tags', {
    recipeId: integer('recipe_id')
        .notNull()
        .references(() => recipes.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
        .notNull()
        .references(() => recipeTags.id, { onDelete: 'cascade' })
}, entry => [
    primaryKey({ columns: [entry.recipeId, entry.tagId] })
])

export const joinRecipeTagRelations = relations(joinRecipeTags, ({ one }) => ({
    recipe: one(recipes, {
        fields: [joinRecipeTags.recipeId],
        references: [recipes.id]
    }),
    tag: one(recipeTags, {
        fields: [joinRecipeTags.tagId],
        references: [recipeTags.id]
    })
}))

export const recipeUtensils = pgTable('recipe_utensils', {
    id: serial('id')
        .primaryKey(),
    name: varchar('name', { length: 256 })
        .unique()
        .notNull()
})

export const recipeUtensilRelations = relations(recipeUtensils, ({ many }) => ({
    recipes: many(joinRecipeUtensils)
}))

export const joinRecipeUtensils = pgTable('join_recipe_utensils', {
    recipeId: integer('recipe_id')
        .notNull()
        .references(() => recipes.id, { onDelete: 'cascade' }),
    utensilId: integer('utensil_id')
        .notNull()
        .references(() => recipeUtensils.id, { onDelete: 'cascade' })
}, entry => [
    primaryKey({ columns: [entry.recipeId, entry.utensilId] })
])

export const joinRecipeUtensilRelations = relations(joinRecipeUtensils, ({ one }) => ({
    recipe: one(recipes, {
        fields: [joinRecipeUtensils.recipeId],
        references: [recipes.id]
    }),
    utensil: one(recipeUtensils, {
        fields: [joinRecipeUtensils.utensilId],
        references: [recipeUtensils.id]
    })
}))

export const recipeIngredients = pgTable('recipe_ingredients', {
    id: serial('id')
        .primaryKey(),
    name: varchar('name', { length: 256 })
        .unique()
        .notNull(),
    density: real('density')
})

export const ingredientRelations = relations(recipeIngredients, ({ many }) => ({
    recipes: many(joinRecipeIngredients)
}))

export const joinRecipeIngredients = pgTable('join_recipe_ingredients', {
    recipeId: integer('recipe_id')
        .notNull()
        .references(() => recipes.id, { onDelete: 'cascade' }),
    ingredientId: integer('ingredient_id')
        .notNull()
        .references(() => recipeIngredients.id, { onDelete: 'restrict' }),
    quantity: numeric('quantity', { precision: 10, scale: 3})
        .notNull(),
    unitType: recipeIngredientUnitType('unit_type')
        .notNull(),
    customUnitName: varchar('custom_unit_name', { length: 256 })
}, entry => [
    primaryKey({ columns: [entry.recipeId, entry.ingredientId] }),
    check('custom_unit_name_required', sql`
        (unit_type = 'custom' AND custom_unit_name IS NOT NULL)
        OR
        (unit_type != 'custom' AND custom_unit_name IS NULL)
    `)
])

export const joinRecipeIngredientRelations = relations(joinRecipeIngredients, ({ one }) => ({
    recipe: one(recipes, {
        fields: [joinRecipeIngredients.recipeId],
        references: [recipes.id]
    }),
    ingredient: one(recipeIngredients, {
        fields: [joinRecipeIngredients.ingredientId],
        references: [recipeIngredients.id]
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
}, recipeInstruction => [
    primaryKey({ columns: [recipeInstruction.recipeId, recipeInstruction.index] })
])

export const recipeInstructionRelations = relations(recipeInstructions, ({ one }) => ({
    recipe: one(recipes, {
        fields: [recipeInstructions.recipeId],
        references: [recipes.id]
    })
}))

export const recipeNotes = pgTable('recipe_notes', {
    id: serial('id')
        .primaryKey(),
    recipeId: integer('recipe_id')
        .notNull()
        .references(() => recipes.id, { onDelete: 'cascade' }),
    text: text('text')
        .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow()
})

export const recipeNoteRelations = relations(recipeNotes, ({ one }) => ({
    recipe: one(recipes, {
        fields: [recipeNotes.recipeId],
        references: [recipes.id]
    })
}))