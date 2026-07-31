import { eq } from 'drizzle-orm'
import { db, ucbIngredients } from '$server/database'

import type { DbOrTx } from '$server/database'
import type { SanitizedIngredient } from '$scripts/types'

type TRecipeIngredient = typeof ucbIngredients.$inferSelect

export class UcbIngredientService {
    static async getById(id: number, dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.ucbIngredients.findFirst({
            where: eq(ucbIngredients.id, id)
        })
    }

    static async getByName(name: string, dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.ucbIngredients.findFirst({
            where: eq(ucbIngredients.name, name)
        })
    }

    static async getAll(dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.ucbIngredients.findMany()
    }

    static async create(name: string, density?: number, dbOrTx: DbOrTx = db) {
        const [ingredient] = await dbOrTx.insert(ucbIngredients)
            .values({ name, density })
            .returning()

        return ingredient
    }

    static async update(data: Partial<TRecipeIngredient> & { id: number }, dbOrTx: DbOrTx = db) {
        const [ingredient] = await dbOrTx.update(ucbIngredients)
            .set(data)
            .where(eq(ucbIngredients.id, data.id))
            .returning()

        return ingredient
    }

    static async delete(id: number, dbOrTx: DbOrTx = db) {
        const [ingredient] = await dbOrTx.delete(ucbIngredients)
            .where(eq(ucbIngredients.id, id))
            .returning()

        return ingredient
    }

    static sanitize(ingredient: TRecipeIngredient): SanitizedIngredient {
        return {
            id: ingredient.id,
            name: ingredient.name,
            density: ingredient.density
        }
    }
}