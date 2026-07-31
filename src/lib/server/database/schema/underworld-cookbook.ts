
import { users } from './user'
import { relations, sql } from 'drizzle-orm'
import { 
    pgTable, serial, integer, 
    timestamp, text, varchar, 
    real, pgEnum, primaryKey, 
    numeric, check 
} from 'drizzle-orm/pg-core'

export const ucbIngredientUnitType = pgEnum('ucb_ingredient_unit_type', ['volume', 'weight', 'custom'])

export const ucbRecipes = pgTable('ucb_recipes', {
    id: serial('id')
        .primaryKey(),
    authorId: integer('author_id')
        .references(() => users.id, { onDelete: 'set null' }),
    parentId: integer('parent_id')
        .references(() => users.id, { onDelete: 'set null' }),
    title: varchar('title', { length: 64 }),
    description: text('description'),
    duration: integer('duration'),
    portions: integer('portions'),
    createdAt: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow()
})

export const ucbRecipeRelations = relations(ucbRecipes, ({ one, many }) => ({
    author: one(users, {
        fields: [ucbRecipes.authorId],
        references: [users.id]
    }),
    parent: one(ucbRecipes, {
        fields: [ucbRecipes.parentId],
        references: [ucbRecipes.id]
    }),
    likedBy: many(users, { relationName: 'liked_by' }),
    tags: many(ucbJoinRecipeTags),
    utensils: many(ucbJoinRecipeUtensils),
    ingredients: many(ucbJoinRecipeIngredients),
    instructions: many(ucbInstructions),
    notes: many(ucbNotes)
}))

export const ucbTags = pgTable('ucb_tags', {
    id: serial('id')
        .primaryKey(),
    name: varchar('name', { length: 256 })
        .unique()
        .notNull()
})

export const ucbTagRelations = relations(ucbTags, ({ many }) => ({
    recipes: many(ucbJoinRecipeTags)
}))

export const ucbJoinRecipeTags = pgTable('ucb_join_recipe_tags', {
    recipeId: integer('recipe_id')
        .notNull()
        .references(() => ucbRecipes.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
        .notNull()
        .references(() => ucbTags.id, { onDelete: 'cascade' })
}, entry => [
    primaryKey({ columns: [entry.recipeId, entry.tagId] })
])

export const ucbJoinRecipeTagRelations = relations(ucbJoinRecipeTags, ({ one }) => ({
    recipe: one(ucbRecipes, {
        fields: [ucbJoinRecipeTags.recipeId],
        references: [ucbRecipes.id]
    }),
    tag: one(ucbTags, {
        fields: [ucbJoinRecipeTags.tagId],
        references: [ucbTags.id]
    })
}))

export const ucbUtensils = pgTable('ucb_utensils', {
    id: serial('id')
        .primaryKey(),
    name: varchar('name', { length: 256 })
        .unique()
        .notNull()
})

export const ucbUtensilRelations = relations(ucbUtensils, ({ many }) => ({
    recipes: many(ucbJoinRecipeUtensils)
}))

export const ucbJoinRecipeUtensils = pgTable('ucb_join_recipe_utensils', {
    recipeId: integer('recipe_id')
        .notNull()
        .references(() => ucbRecipes.id, { onDelete: 'cascade' }),
    utensilId: integer('utensil_id')
        .notNull()
        .references(() => ucbUtensils.id, { onDelete: 'cascade' })
}, entry => [
    primaryKey({ columns: [entry.recipeId, entry.utensilId] })
])

export const ucbJoinRecipeUtensilRelations = relations(ucbJoinRecipeUtensils, ({ one }) => ({
    recipe: one(ucbRecipes, {
        fields: [ucbJoinRecipeUtensils.recipeId],
        references: [ucbRecipes.id]
    }),
    utensil: one(ucbUtensils, {
        fields: [ucbJoinRecipeUtensils.utensilId],
        references: [ucbUtensils.id]
    })
}))

export const ucbIngredients = pgTable('ucb_ingredients', {
    id: serial('id')
        .primaryKey(),
    name: varchar('name', { length: 256 })
        .unique()
        .notNull(),
    density: real('density')
})

export const ucbIngredientRelations = relations(ucbIngredients, ({ many }) => ({
    recipes: many(ucbJoinRecipeIngredients)
}))

export const ucbJoinRecipeIngredients = pgTable('ucb_join_recipe_ingredients', {
    recipeId: integer('recipe_id')
        .notNull()
        .references(() => ucbRecipes.id, { onDelete: 'cascade' }),
    ingredientId: integer('ingredient_id')
        .notNull()
        .references(() => ucbIngredients.id, { onDelete: 'restrict' }),
    quantity: numeric('quantity', { precision: 10, scale: 3})
        .notNull(),
    unitType: ucbIngredientUnitType('unit_type')
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

export const ucbJoinRecipeIngredientRelations = relations(ucbJoinRecipeIngredients, ({ one }) => ({
    recipe: one(ucbRecipes, {
        fields: [ucbJoinRecipeIngredients.recipeId],
        references: [ucbRecipes.id]
    }),
    ingredient: one(ucbIngredients, {
        fields: [ucbJoinRecipeIngredients.ingredientId],
        references: [ucbIngredients.id]
    })
}))

export const ucbInstructions = pgTable('ucb_instructions', {
    recipeId: integer('recipe_id')
        .notNull()
        .references(() => ucbRecipes.id, { onDelete: 'cascade' }),
    index: integer('index')
        .notNull(),
    text: text('text')
        .notNull()
}, recipeInstruction => [
    primaryKey({ columns: [recipeInstruction.recipeId, recipeInstruction.index] })
])

export const ucbInstructionRelations = relations(ucbInstructions, ({ one }) => ({
    recipe: one(ucbRecipes, {
        fields: [ucbInstructions.recipeId],
        references: [ucbRecipes.id]
    })
}))

export const ucbNotes = pgTable('ucb_notes', {
    id: serial('id')
        .primaryKey(),
    recipeId: integer('recipe_id')
        .notNull()
        .references(() => ucbRecipes.id, { onDelete: 'cascade' }),
    text: text('text')
        .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow()
})

export const ucbNoteRelations = relations(ucbNotes, ({ one }) => ({
    recipe: one(ucbRecipes, {
        fields: [ucbNotes.recipeId],
        references: [ucbRecipes.id]
    })
}))