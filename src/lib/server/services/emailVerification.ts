
import { eq } from 'drizzle-orm'
import { db, users, emailVerifications } from '$server/database'

type TEmailVerification = typeof emailVerifications.$inferSelect
type TEmailVerificationWithUser = TEmailVerification & { user: typeof users.$inferSelect }

export class EmailVerification {
	static async create(userId: number, code: string) {
		const [ emailverification ] = await db.insert(emailVerifications)
			.values({ userId, code })
			.returning()
 
		return emailverification
	}

	static async getByUserId(userId: number, includeUser: true): Promise<undefined | TEmailVerificationWithUser>
	static async getByUserId(userId: number, includeUser?: false): Promise<undefined | TEmailVerification>
	static async getByUserId(userId: number, includeUser?: boolean) {
		return await db.query.emailVerifications.findFirst({
			where: eq(emailVerifications.userId, userId),
			with: includeUser ? { user: true } : undefined
		})
	}

	static async resolve(id: number, userId: number) {
		await db.transaction(async tx => {
			await tx.update(users)
				.set({ verified: true })
				.where(eq(users.id, userId))

			await tx.delete(emailVerifications)
				.where(eq(emailVerifications.id, id))
		})
	}

	static async delete(id: number) {
		await db.delete(emailVerifications)
				.where(eq(emailVerifications.id, id))
	}

	static async deleteAllByUserId(userId: number) {
		const deleted = await db.delete(emailVerifications)
			.where(eq(emailVerifications.userId, userId))
			.returning()

		return deleted
	}
}
