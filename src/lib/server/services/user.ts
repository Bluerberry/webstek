
import { eq } from 'drizzle-orm'
import { db, users } from '$server/db'

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
}
