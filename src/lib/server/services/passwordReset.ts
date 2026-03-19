
import { eq } from 'drizzle-orm'
import { db, users, passwordResets } from '$server/database'

type TPasswordReset = typeof passwordResets.$inferSelect
type TPasswordResetWithUser = TPasswordReset & { user: typeof users.$inferSelect }

export class PasswordReset {
	static async create(userId: number, code: string) {
		const [ verification ] = await db.insert(passwordResets)
			.values({ userId, code })
			.returning()
 
		return verification
	}

	static async getByUserId(userId: number, includeUser: true): Promise<undefined | TPasswordResetWithUser>
	static async getByUserId(userId: number, includeUser?: false): Promise<undefined | TPasswordReset>
	static async getByUserId(userId: number, includeUser?: boolean) {
		return await db.query.passwordResets.findFirst({
			where: eq(passwordResets.userId, userId),
			with: includeUser ? { user: true } : undefined
		})
	}

	static async resolve(id: number, userId: number) {
		await db.transaction(async tx => {
			await tx.update(users)
				.set({ verified: true })
				.where(eq(users.id, userId))

			await tx.delete(passwordResets)
				.where(eq(passwordResets.id, id))
		})
	}

	static async delete(id: number) {
		await db.delete(passwordResets)
				.where(eq(passwordResets.id, id))
	}

	static async deleteAllByUserId(userId: number) {
		const deleted = await db.delete(passwordResets)
			.where(eq(passwordResets.userId, userId))
			.returning()

		return deleted
	}
}
