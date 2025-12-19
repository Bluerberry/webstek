
import { eq } from 'drizzle-orm'
import { db, users, sessions } from '$server/db'

type TSession = typeof sessions.$inferSelect
type TSessionWithUser = TSession & { user: typeof users.$inferSelect }

export class Session {
	static async create(id: string, token: string, userId: number) {
		const [ session ] = await db.insert(sessions)
			.values({ id, token, userId })
			.returning()

		return session
	}

	static async getById(id: string, includeUser: true): Promise<undefined | TSessionWithUser>
	static async getById(id: string, includeUser?: false): Promise<undefined | TSession>
	static async getById(id: string, includeUser?: boolean) {
		return await db.query.sessions.findFirst({
			where: eq(sessions.id, id),
			with: includeUser ? { user: true } : undefined
		})
	}

	static async updateLastValidated(id: string, now: Date) {
		await db.update(sessions)
			.set({ lastValidatedAt: now })
			.where(eq(sessions.id, id))
	}

	static async delete(id: string) {
		const [ session ] = await db.delete(sessions)
			.where(eq(sessions.id, id))
			.returning()

		return session
	}
}
