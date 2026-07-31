import { eq } from 'drizzle-orm'
import { db, ucbUtensils } from '$server/database'

import type { DbOrTx } from '$server/database'
import type { SanitizedUtensil } from '$scripts/types'

type TUtensil = typeof ucbUtensils.$inferSelect

export class UtensilService {
    static async getById(id: number, dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.ucbUtensils.findFirst({
            where: eq(ucbUtensils.id, id)
        })
    }

    static async getByName(name: string, dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.ucbUtensils.findFirst({
            where: eq(ucbUtensils.name, name)
        })
    }

    static async getAll(dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.ucbUtensils.findMany()
    }

    static async create(name: string, dbOrTx: DbOrTx = db) {
        const [utensil] = await dbOrTx.insert(ucbUtensils)
            .values({ name })
            .returning()

        return utensil
    }

    static async delete(id: number, dbOrTx: DbOrTx = db) {
        const [utensil] = await dbOrTx.delete(ucbUtensils)
            .where(eq(ucbUtensils.id, id))
            .returning()

        return utensil
    }

    static sanitize(utensil: TUtensil): SanitizedUtensil {
        return {
            id: utensil.id,
            name: utensil.name
        }
    }
}