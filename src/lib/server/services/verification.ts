
import { eq } from 'drizzle-orm'
import { db, users, verifications } from '$server/database'

type TVerification = typeof verifications.$inferSelect
type TVerificationWithUser = TVerification & { user: typeof users.$inferSelect }

export class Verification {
	static async create(userId: number, code: string) {
		const [ verification ] = await db.insert(verifications)
			.values({ userId, code })
			.returning()
 
		return verification
	}

	static async getByUserId(userId: number, includeUser: true): Promise<undefined | TVerificationWithUser>
	static async getByUserId(userId: number, includeUser?: false): Promise<undefined | TVerification>
	static async getByUserId(userId: number, includeUser?: boolean) {
		return await db.query.verifications.findFirst({
			where: eq(verifications.userId, userId),
			with: includeUser ? { user: true } : undefined
		})
	}

	static async resolve(id: number, userId: number) {
		await db.transaction(async tx => {
			await tx.update(users)
				.set({ verified: true })
				.where(eq(users.id, userId))

			await tx.delete(verifications)
				.where(eq(verifications.id, id))
		})
	}

	static async delete(id: number) {
		await db.delete(verifications)
				.where(eq(verifications.id, id))
	}

	static async deleteAllByUserId(userId: number) {
		const deleted = await db.delete(verifications)
			.where(eq(verifications.userId, userId))
			.returning()

		return deleted
	}
}
