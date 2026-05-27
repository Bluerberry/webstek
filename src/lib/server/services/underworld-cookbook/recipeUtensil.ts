import { eq } from 'drizzle-orm'
import { db, recipeUtensils } from '$server/database'

import type { DbOrTx } from '$server/database'

export class RecipeUtensil {
    static async getById(id: number, dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.recipeUtensils.findFirst({
            where: eq(recipeUtensils.id, id)
        })
    }

    static async getByName(name: string, dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.recipeUtensils.findFirst({
            where: eq(recipeUtensils.name, name)
        })
    }

    static async getAll(dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.recipeUtensils.findMany()
    }

    static async create(name: string, dbOrTx: DbOrTx = db) {
        const [utensil] = await dbOrTx.insert(recipeUtensils)
            .values({ name })
            .returning()

        return utensil
    }

    static async delete(id: number, dbOrTx: DbOrTx = db) {
        const [utensil] = await dbOrTx.delete(recipeUtensils)
            .where(eq(recipeUtensils.id, id))
            .returning()

        return utensil
    }
}