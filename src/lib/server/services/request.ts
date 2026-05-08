
import { requests, db } from '$server/database'

import type { DbOrTx } from '$server/database'

type TRequest = typeof requests.$inferSelect

export class Request {
    static async create(type: TRequest['type'], url: TRequest['url'], responseTime: TRequest['responseTime'], dbOrTx: DbOrTx = db) {
        const [ request ] = await dbOrTx.insert(requests)
            .values({ type, url, responseTime })
            .returning()

        return request
    }

    static async getAll(dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.requests.findMany()
    }
}
