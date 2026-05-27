import { eq } from 'drizzle-orm'
import { db, recipeIngredients } from '$server/database'

import type { DbOrTx } from '$server/database'

type TRecipeIngredient = typeof recipeIngredients.$inferSelect

export class RecipeIngredient {
    static async getById(id: number, dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.recipeIngredients.findFirst({
            where: eq(recipeIngredients.id, id)
        })
    }

    static async getByName(name: string, dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.recipeIngredients.findFirst({
            where: eq(recipeIngredients.name, name)
        })
    }

    static async getAll(dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.recipeIngredients.findMany()
    }

    static async create(name: string, density?: number, dbOrTx: DbOrTx = db) {
        const [ingredient] = await dbOrTx.insert(recipeIngredients)
            .values({ name, density })
            .returning()

        return ingredient
    }

    static async update(data: Partial<TRecipeIngredient> & { id: number }, dbOrTx: DbOrTx = db) {
        const [ingredient] = await dbOrTx.update(recipeIngredients)
            .set(data)
            .where(eq(recipeIngredients.id, data.id))
            .returning()

        return ingredient
    }

    static async delete(id: number, dbOrTx: DbOrTx = db) {
        const [ingredient] = await dbOrTx.delete(recipeIngredients)
            .where(eq(recipeIngredients.id, id))
            .returning()

        return ingredient
    }
}