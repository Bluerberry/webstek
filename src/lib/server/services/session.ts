
import { eq, and, not } from 'drizzle-orm'
import { db, users, sessions } from '$server/database'

import type { DbOrTx } from '$server/database'
import type { SanitizedSession } from '$scripts/types'

type TSession = typeof sessions.$inferSelect
type TSessionWithUser = TSession & { user: typeof users.$inferSelect }

export class Session {
	static async create(id: string, token: string, userId: number, country: string, browserName?: string, browserVersion?: string, dbOrTx: DbOrTx = db) {
		const [ session ] = await dbOrTx.insert(sessions)
			.values({ id, token, userId, country, browserName, browserVersion })
			.returning()

		return session
	}

	static async getById(id: string, includeUser: true, dbOrTx?: DbOrTx): Promise<undefined | TSessionWithUser>
	static async getById(id: string, includeUser?: false, dbOrTx?: DbOrTx): Promise<undefined | TSession>
	static async getById(id: string, includeUser?: boolean, dbOrTx: DbOrTx = db) {
		return await dbOrTx.query.sessions.findFirst({
			where: eq(sessions.id, id),
			with: includeUser ? { user: true } : undefined
		})
	}

	static async getByUserId(userId: number, dbOrTx: DbOrTx = db) {
		return await dbOrTx.query.sessions.findMany({
			where: eq(sessions.userId, userId)
		})
	}

	static async update(data: Partial<TSession> & { id: string }, dbOrTx: DbOrTx = db) {
		await dbOrTx.update(sessions)
			.set(data)
			.where(eq(sessions.id, data.id))
	}

	static async delete(id: string, dbOrTx: DbOrTx = db) {
		const [ deleted ] = await dbOrTx.delete(sessions)
			.where(eq(sessions.id, id))
			.returning()

		return deleted
	}

	static async deleteByUserId(userId: number, dbOrTx: DbOrTx = db) {
		const deleted = await dbOrTx.delete(sessions)
			.where(eq(sessions.userId, userId))
			.returning()

		return deleted
	}

	static async deleteAllExceptCurrent(userId: number, sessionId: string, dbOrTx: DbOrTx = db) {
		const deleted = await dbOrTx.delete(sessions)
			.where(and(
				eq(sessions.userId, userId), 
				not(eq(sessions.id, sessionId))
			))
			.returning()

		return deleted
	}

	static sanitize(session: TSession): SanitizedSession {
		return {
			id: session.id,
			country: session.country ?? undefined,
			browserName: session.browserName ?? undefined,
			browserVersion: session.browserVersion ?? undefined,
			lastValidatedAt: session.lastValidatedAt,
			createdAt: session.createdAt
		}
	}
}
