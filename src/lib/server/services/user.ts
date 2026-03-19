
import { eq } from 'drizzle-orm'
import { db, sessions, users } from '$server/database'
import type { SanitizedUser } from '$scripts/types'

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

	static async setCollectMetadata(id: number, value: boolean) {
		await db.transaction(async tx => {
			await tx.update(users)
				.set({ collectMetadata: value })
				.where(eq(users.id, id))
	
			if (value === false) {
				await tx.update(sessions)
					.set({
						country: null,
						browserName: null,
						browserVersion: null
					})
			}
		})
	}

	static async update(data: Partial<TUser> & { id: number }) {
		await db.update(users)
			.set(data)
			.where(eq(users.id, data.id))
	}

	static async delete(id: number) {
		const [ user ] = await db.delete(users)
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
