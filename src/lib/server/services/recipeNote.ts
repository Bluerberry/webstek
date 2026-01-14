
import { count, eq } from 'drizzle-orm'
import { db, recipeNotes } from '$server/database'

type TRecipeNote = typeof recipeNotes.$inferSelect

export class RecipeNote {
	static async create(userId: number, recipeId: number, text: string) {
		const [ note ] = await db.insert(recipeNotes)
			.values({ userId, recipeId, text})
			.returning()

		return note
	}

	static async getByUserId(userId: number) {
		return await db.query.recipeNotes.findMany({
			where: eq(recipeNotes.userId, userId)
		})
	}

	static async update(data: Partial<TRecipeNote> & { id: number }) {
		await db.update(recipeNotes)
			.set(data)
			.where(eq(recipeNotes.id, data.id))
	}

	static async delete(id: number) {
		const [ note ] = await db.delete(recipeNotes)
			.where(eq(recipeNotes.id, id))
			.returning()

		return note
	}
}
