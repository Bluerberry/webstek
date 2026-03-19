
import { eq } from 'drizzle-orm'
import { db, users, sessions } from '$server/database'
import type { SanitizedSession } from '$scripts/types'

type TSession = typeof sessions.$inferSelect
type TSessionWithUser = TSession & { user: typeof users.$inferSelect }

export class Session {
	static async create(id: string, token: string, userId: number, country: string, browserName?: string, browserVersion?: string) {
		const [ session ] = await db.insert(sessions)
			.values({ id, token, userId, country, browserName, browserVersion })
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

	static async getByUserId(userId: number) {
		return await db.query.sessions.findMany({
			where: eq(sessions.userId, userId)
		})
	}

	static async update(data: Partial<TSession> & { id: string }) {
		await db.update(sessions)
			.set(data)
			.where(eq(sessions.id, data.id))
	}

	static async delete(id: string) {
		const [ deleted ] = await db.delete(sessions)
			.where(eq(sessions.id, id))
			.returning()

		return deleted
	}

	static async deleteAllByUserId(userId: number) {
		const deleted = await db.delete(sessions)
			.where(eq(sessions.userId, userId))
			.returning()

		return deleted
	}

	static sanitize(session: TSession): SanitizedSession {
		return {
			id: session.id,
			country: session.country ?? undefined,
			browserName: session.browserName ?? undefined,
			browserVersion: session.browserVersion ?? undefined,
			lastVerifiedAt: session.lastValidatedAt,
			createdAt: session.createdAt
		}
	}
}
