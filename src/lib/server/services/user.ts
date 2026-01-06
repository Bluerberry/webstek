
import { eq } from 'drizzle-orm'
import { db, users } from '$server/database'
import type { SanitizedUser } from '$lib/types'

type TUser = typeof users.$inferSelect

export class User {
	static async create(email: string, username: string, password: string) {
		const [ user ] = await db.insert(users)
			.values({ email, username, password })
			.returning()

		return user
	}

	static async getById(id: number) {
		return await db.query.users.findFirst({
			where: eq(users.id, id)
		})
	}

	static async getByEmail(email: string) {
		return await db.query.users.findFirst({
			where: eq(users.email, email)
		})
	}

	static async update(data: Partial<TUser> & { id: number }) {
		await db.update(users)
			.set(data)
			.where(eq(users.id, data.id))
	}

	static sanitize(user: TUser): SanitizedUser {
		return {
			id: user.id,
			email: user.email,
			verified: user.verified,
			username: user.username
		}
	}
}
