
import { UserService } from './user'
import { eq, sql } from 'drizzle-orm'
import { db, users, passwordResets } from '$server/database'

import type { DbOrTx } from '$server/database'

type TPasswordReset = typeof passwordResets.$inferSelect
type TPasswordResetWithUser = TPasswordReset & { user: typeof users.$inferSelect }

export class PasswordResetService {
	static async getByUserId(userId: number, includeUser: true, dbOrTx?: DbOrTx): Promise<undefined | TPasswordResetWithUser>
	static async getByUserId(userId: number, includeUser?: false, dbOrTx?: DbOrTx): Promise<undefined | TPasswordReset>
	static async getByUserId(userId: number, includeUser?: boolean, dbOrTx: DbOrTx = db) {
		return await dbOrTx.query.passwordResets.findFirst({
			where: eq(passwordResets.userId, userId),
			with: includeUser ? { user: true } : undefined
		})
	}

	static async upsert(userId: number, code: string, dbOrTx: DbOrTx = db) {
		const [ passwordReset ] = await dbOrTx.insert(passwordResets)
			.values({ userId, code })
			.onConflictDoUpdate({
				target: passwordResets.userId,
				set: { code, createdAt: sql`now()` }
			})
			.returning()

		return passwordReset
	}

	static async resolve(id: number, password: string, dbOrTx: DbOrTx = db) {
		return await dbOrTx.transaction(async tx => {
			const [ deleted ] = await tx.delete(passwordResets)
				.where(eq(passwordResets.id, id))
				.returning()

			if (!deleted) return false
			await UserService.update({ id: deleted.userId, password }, tx)
			return true
		})
	}
}
