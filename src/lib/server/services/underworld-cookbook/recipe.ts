
import { and, eq } from 'drizzle-orm'
import { db, recipes, joinRecipeTags, joinRecipeUtensils, joinRecipeIngredients } from '$server/database'

import type { DbOrTx } from '$server/database'

type TRecipe = typeof recipes.$inferSelect
type TIngredientEntry = typeof joinRecipeIngredients.$inferInsert

export class Recipe {
    static async getById(id: number, dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.recipes.findFirst({
            where: eq(recipes.id, id),
            with: {
                tags: { with: { tag: true } },
                utensils: { with: { utensil: true } },
                ingredients: { with: { ingredient: true } },
                instructions: true,
                notes: true
            }
        })
    }
    
    static async getByAuthor(authorId: number, dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.recipes.findMany({
            where: eq(recipes.authorId, authorId)
        })
    }

    static async getAll(dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.recipes.findMany()
    }

    static async create(data: Omit<TRecipe, 'id' | 'createdAt'>, dbOrTx: DbOrTx = db) {
        const [recipe] = await dbOrTx.insert(recipes)
            .values(data)
            .returning()

        return recipe
    }

    static async update(data: Partial<TRecipe> & { id: number }, dbOrTx: DbOrTx = db) {
        const [recipe] = await dbOrTx.update(recipes)
            .set(data)
            .where(eq(recipes.id, data.id))
            .returning()

        return recipe
    }

    static async delete(id: number, dbOrTx: DbOrTx = db) {
        const [recipe] = await dbOrTx.delete(recipes)
            .where(eq(recipes.id, id))
            .returning()

        return recipe
    }

    static async addTag(recipeId: number, tagId: number, dbOrTx: DbOrTx = db) {
        await dbOrTx.insert(joinRecipeTags)
            .values({ recipeId, tagId })
    }

    static async removeTag(recipeId: number, tagId: number, dbOrTx: DbOrTx = db) {
        await dbOrTx.delete(joinRecipeTags)
            .where(and(
                eq(joinRecipeTags.recipeId, recipeId),
                eq(joinRecipeTags.tagId, tagId)
            ))
    }

    static async addUtensil(recipeId: number, utensilId: number, dbOrTx: DbOrTx = db) {
        await dbOrTx.insert(joinRecipeUtensils)
            .values({ recipeId, utensilId })
    }

    static async removeUtensil(recipeId: number, utensilId: number, dbOrTx: DbOrTx = db) {
        await dbOrTx.delete(joinRecipeUtensils)
            .where(and(
                eq(joinRecipeUtensils.recipeId, recipeId),
                eq(joinRecipeUtensils.utensilId, utensilId)
            ))
    }

    static async addIngredient(recipeId: number, data: Omit<TIngredientEntry, 'recipeId'>, dbOrTx: DbOrTx = db) {
        await dbOrTx.insert(joinRecipeIngredients)
            .values({ recipeId, ...data })
    }

    static async updateIngredient(recipeId: number, data: Partial<TIngredientEntry> & { ingredientId: number }, dbOrTx: DbOrTx = db) {
        await dbOrTx.update(joinRecipeIngredients)
            .set(data)
            .where(and(
                eq(joinRecipeIngredients.recipeId, recipeId),
                eq(joinRecipeIngredients.ingredientId, data.ingredientId)
            ))
    }

    static async removeIngredient(recipeId: number, ingredientId: number, dbOrTx: DbOrTx = db) {
        await dbOrTx.delete(joinRecipeIngredients)
            .where(and(
                eq(joinRecipeIngredients.recipeId, recipeId),
                eq(joinRecipeIngredients.ingredientId, ingredientId)
            ))
    }
}