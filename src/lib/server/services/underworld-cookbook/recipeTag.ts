import { eq } from 'drizzle-orm'
import { db, recipeTags } from '$server/database'

import type { DbOrTx } from '$server/database'

export class RecipeTag {
    static async getById(id: number, dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.recipeTags.findFirst({
            where: eq(recipeTags.id, id)
        })
    }

    static async getByName(tag: string, dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.recipeTags.findFirst({
            where: eq(recipeTags.tag, tag)
        })
    }

    static async getAll(dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.recipeTags.findMany()
    }

    static async create(tag: string, dbOrTx: DbOrTx = db) {
        const [result] = await dbOrTx.insert(recipeTags)
            .values({ tag })
            .returning()

        return result
    }

    static async delete(id: number, dbOrTx: DbOrTx = db) {
        const [result] = await dbOrTx.delete(recipeTags)
            .where(eq(recipeTags.id, id))
            .returning()

        return result
    }
}