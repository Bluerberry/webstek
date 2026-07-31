import { eq } from 'drizzle-orm'
import { db, ucbTags } from '$server/database'

import type { DbOrTx } from '$server/database'
import type { SanitizedTag } from '$scripts/types'

type TTag = typeof ucbTags.$inferSelect

export class UcbTagService {
    static async getById(id: number, dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.ucbTags.findFirst({
            where: eq(ucbTags.id, id)
        })
    }

    static async getByName(name: string, dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.ucbTags.findFirst({
            where: eq(ucbTags.name, name)
        })
    }

    static async getAll(dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.ucbTags.findMany()
    }

    static async create(name: string, dbOrTx: DbOrTx = db) {
        const [result] = await dbOrTx.insert(ucbTags)
            .values({ name })
            .returning()

        return result
    }

    static async delete(id: number, dbOrTx: DbOrTx = db) {
        const [result] = await dbOrTx.delete(ucbTags)
            .where(eq(ucbTags.id, id))
            .returning()

        return result
    }

    static sanitize(tag: TTag): SanitizedTag {
        return {
            id: tag.id,
            name: tag.name
        }
    }
}