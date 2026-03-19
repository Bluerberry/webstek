
import { eq } from 'drizzle-orm'
import { db, sessions, users } from '$server/database'

import type { DbOrTx } from '$server/database'
import type { SanitizedUser } from '$scripts/types'

type TUser = typeof users.$inferSelect

export class User {
	static async create(email: string, username: string, password: string, dbOrTx: DbOrTx = db) {
		const [ user ] = await dbOrTx.insert(users)
			.values({ email, username, password })
			.returning()

		return user
	}

	static async getById(id: number, dbOrTx: DbOrTx = db) {
		return await dbOrTx.query.users.findFirst({
			where: eq(users.id, id)
		})
	}

	static async getByEmail(email: string, dbOrTx: DbOrTx = db) {
		return await dbOrTx.query.users.findFirst({
			where: eq(users.email, email)
		})
	}

	static async update(data: Partial<TUser> & { id: number }, dbOrTx: DbOrTx = db) {
		await dbOrTx.update(users)
			.set(data)
			.where(eq(users.id, data.id))
	}

	static async delete(id: number, dbOrTx: DbOrTx = db) {
		const [ user ] = await dbOrTx.delete(users)
			.where(eq(users.id, id))
			.returning()

		return user
	}

	static sanitize(user: TUser): SanitizedUser {
		return {
			id: user.id,
			email: user.email,
			verified: user.verified,
			username: user.username,
			collectMetadata: user.collectMetadata
		}
	}
}
