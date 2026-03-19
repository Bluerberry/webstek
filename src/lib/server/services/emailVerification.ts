
import { eq, sql } from 'drizzle-orm'
import { db, users, emailVerifications } from '$server/database'

import type { DbOrTx } from '$server/database'

type TEmailVerification = typeof emailVerifications.$inferSelect
type TEmailVerificationWithUser = TEmailVerification & { user: typeof users.$inferSelect }

export class EmailVerification {
	static async create(userId: number, code: string, dbOrTx: DbOrTx = db) {
		const [ emailVerification ] = await dbOrTx.insert(emailVerifications)
			.values({ userId, code })
			.onConflictDoUpdate({
				target: emailVerifications.userId,
				set: { code, createdAt: sql`now()` }
			})
			.returning()

		return emailVerification
	}

	static async getByUserId(userId: number, includeUser: true, dbOrTx?: DbOrTx): Promise<undefined | TEmailVerificationWithUser>
	static async getByUserId(userId: number, includeUser?: false, dbOrTx?: DbOrTx): Promise<undefined | TEmailVerification>
	static async getByUserId(userId: number, includeUser?: boolean, dbOrTx: DbOrTx = db) {
		return await dbOrTx.query.emailVerifications.findFirst({
			where: eq(emailVerifications.userId, userId),
			with: includeUser ? { user: true } : undefined
		})
	}

	static async delete(id: number, dbOrTx: DbOrTx = db) {
		await dbOrTx.delete(emailVerifications)
				.where(eq(emailVerifications.id, id))
	}

	static async deleteByUserId(userId: number, dbOrTx: DbOrTx = db) {
		const deleted = await dbOrTx.delete(emailVerifications)
			.where(eq(emailVerifications.userId, userId))
			.returning()

		return deleted
	}
}
