
import { and, eq } from 'drizzle-orm'
import { UcbTagService, UtensilService, UcbIngredientService } from '$server/services'
import { db, ucbRecipes, ucbJoinRecipeTags, ucbJoinRecipeUtensils, ucbJoinRecipeIngredients } from '$server/database'

import type { DbOrTx } from '$server/database'
import type { SanitizedRecipe } from '$scripts/types'
import { UcbInstructionService } from './ucbInstruction'

type TRecipe = typeof ucbRecipes.$inferSelect
type TIngredientEntry = typeof ucbJoinRecipeIngredients.$inferInsert
type TRecipeWithRelations = NonNullable<Awaited<ReturnType<typeof UcbRecipeService.getById>>>

export class UcbRecipeService {
    static async getById(id: number, dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.ucbRecipes.findFirst({
            where: eq(ucbRecipes.id, id),
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
        return await dbOrTx.query.ucbRecipes.findMany({
            where: eq(ucbRecipes.authorId, authorId)
        })
    }

    static async getAll(dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.ucbRecipes.findMany()
    }

    static async create(data: Omit<TRecipe, 'id' | 'createdAt'>, dbOrTx: DbOrTx = db) {
        const [recipe] = await dbOrTx.insert(ucbRecipes)
            .values(data)
            .returning()

        return recipe
    }

    static async update(data: Partial<TRecipe> & { id: number }, dbOrTx: DbOrTx = db) {
        const [recipe] = await dbOrTx.update(ucbRecipes)
            .set(data)
            .where(eq(ucbRecipes.id, data.id))
            .returning()

        return recipe
    }

    static async delete(id: number, dbOrTx: DbOrTx = db) {
        const [recipe] = await dbOrTx.delete(ucbRecipes)
            .where(eq(ucbRecipes.id, id))
            .returning()

        return recipe
    }

    static async addTag(recipeId: number, tagId: number, dbOrTx: DbOrTx = db) {
        await dbOrTx.insert(ucbJoinRecipeTags)
            .values({ recipeId, tagId })
    }

    static async removeTag(recipeId: number, tagId: number, dbOrTx: DbOrTx = db) {
        await dbOrTx.delete(ucbJoinRecipeTags)
            .where(and(
                eq(ucbJoinRecipeTags.recipeId, recipeId),
                eq(ucbJoinRecipeTags.tagId, tagId)
            ))
    }

    static async addUtensil(recipeId: number, utensilId: number, dbOrTx: DbOrTx = db) {
        await dbOrTx.insert(ucbJoinRecipeUtensils)
            .values({ recipeId, utensilId })
    }

    static async removeUtensil(recipeId: number, utensilId: number, dbOrTx: DbOrTx = db) {
        await dbOrTx.delete(ucbJoinRecipeUtensils)
            .where(and(
                eq(ucbJoinRecipeUtensils.recipeId, recipeId),
                eq(ucbJoinRecipeUtensils.utensilId, utensilId)
            ))
    }

    static async addIngredient(recipeId: number, data: Omit<TIngredientEntry, 'recipeId'>, dbOrTx: DbOrTx = db) {
        await dbOrTx.insert(ucbJoinRecipeIngredients)
            .values({ recipeId, ...data })
    }

    static async updateIngredient(recipeId: number, data: Partial<TIngredientEntry> & { ingredientId: number }, dbOrTx: DbOrTx = db) {
        await dbOrTx.update(ucbJoinRecipeIngredients)
            .set(data)
            .where(and(
                eq(ucbJoinRecipeIngredients.recipeId, recipeId),
                eq(ucbJoinRecipeIngredients.ingredientId, data.ingredientId)
            ))
    }

    static async removeIngredient(recipeId: number, ingredientId: number, dbOrTx: DbOrTx = db) {
        await dbOrTx.delete(ucbJoinRecipeIngredients)
            .where(and(
                eq(ucbJoinRecipeIngredients.recipeId, recipeId),
                eq(ucbJoinRecipeIngredients.ingredientId, ingredientId)
            ))
    }

    static sanitize(recipe: TRecipeWithRelations): SanitizedRecipe {
        return {
            id: recipe.id,
            title: recipe.title,
            description: recipe.description,
            duration: recipe.duration,
            portions: recipe.portions,
            tags: recipe.tags.map(entry => UcbTagService.sanitize(entry.tag)),
            utensils: recipe.utensils.map(entry => UtensilService.sanitize(entry.utensil)),
            ingredients: recipe.ingredients.map(entry => ({
                ...UcbIngredientService.sanitize(entry.ingredient),
                quantity: Number(entry.quantity),
                unitType: entry.unitType,
                customUnit: entry.customUnitName
            })),
            instructions: recipe.instructions
                .map(instruction => UcbInstructionService.sanitize(instruction))
                .sort((a, b) => a.index - b.index),
            parentId: recipe.parentId,
            authorId: recipe.authorId,
            createdAt: recipe.createdAt
        }
    }
}