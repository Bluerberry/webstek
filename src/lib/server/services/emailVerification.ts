
import { UserService } from './user'
import { eq, sql } from 'drizzle-orm'
import { db, users, emailVerifications } from '$server/database'

import type { DbOrTx } from '$server/database'

type TEmailVerification = typeof emailVerifications.$inferSelect
type TEmailVerificationWithUser = TEmailVerification & { user: typeof users.$inferSelect }

export class EmailVerificationService {
	static async getByUserId(userId: number, includeUser: true, dbOrTx?: DbOrTx): Promise<undefined | TEmailVerificationWithUser>
	static async getByUserId(userId: number, includeUser?: false, dbOrTx?: DbOrTx): Promise<undefined | TEmailVerification>
	static async getByUserId(userId: number, includeUser?: boolean, dbOrTx: DbOrTx = db) {
		return await dbOrTx.query.emailVerifications.findFirst({
			where: eq(emailVerifications.userId, userId),
			with: includeUser ? { user: true } : undefined
		})
	}

	static async upsert(userId: number, code: string, dbOrTx: DbOrTx = db) {
		const [ emailVerification ] = await dbOrTx.insert(emailVerifications)
			.values({ userId, code })
			.onConflictDoUpdate({
				target: emailVerifications.userId,
				set: { code, createdAt: sql`now()` }
			})
			.returning()

		return emailVerification
	}

	static async resolve(id: number, dbOrTx: DbOrTx = db) {
		return await dbOrTx.transaction(async tx => {
			const [ deleted ] = await tx.delete(emailVerifications)
				.where(eq(emailVerifications.id, id))
				.returning()

			if (!deleted) return false
			await UserService.update({ id: deleted.userId, verified: true }, tx)
			return true
		})
	}
}
