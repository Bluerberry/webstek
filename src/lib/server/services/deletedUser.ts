
import { deletedUsers, db } from '$server/database'
import { count, gte, lt } from 'drizzle-orm'

import type { DbOrTx } from '$server/database'

export class DeletedUser {
    static async create(userCreatedAt: Date, dbOrTx: DbOrTx = db) {
        const [ deletedUser ] = await dbOrTx.insert(deletedUsers)
            .values({ userCreatedAt })
            .returning()

        return deletedUser
    }

    static async getCreatedSince(date: Date, dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.deletedUsers.findMany({
            where: gte(deletedUsers.userCreatedAt, date),
            orderBy: deletedUsers.userCreatedAt
        })
    }

    static async getDeletedSince(date: Date, dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.deletedUsers.findMany({
            where: gte(deletedUsers.userDeletedAt, date),
            orderBy: deletedUsers.userDeletedAt
        })
    }

    static async countBefore(date: Date, dbOrTx: DbOrTx = db) {
        const [[ created ], [ deleted ]] = await Promise.all([ 
            dbOrTx
                .select({ count: count() })
                .from(deletedUsers)
                .where(lt(deletedUsers.userCreatedAt, date)),
            dbOrTx
                .select({ count: count() })
                .from(deletedUsers)
                .where(lt(deletedUsers.userDeletedAt, date))
        ])
        
        return created.count - deleted.count
    }
}
