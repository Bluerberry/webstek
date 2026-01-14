
import { count, eq } from 'drizzle-orm'
import { db, recipes } from '$server/database'

type TRecipe = typeof recipes.$inferSelect

export class Recipe {
	static async create(name: string, duration: number, isPublic: boolean, authorId: number) {
		const [ recipe ] = await db.insert(recipes)
			.values({ name, duration, isPublic, authorId })
			.returning()

		return recipe
	}

	static async getByAuthorId(authorId: number) {
		return await db.query.recipes.findMany({
			where: eq(recipes.authorId, authorId)
		})
	}

	static async update(data: Partial<TRecipe> & { id: number }) {
		await db.update(recipes)
			.set(data)
			.where(eq(recipes.id, data.id))
	}

	static async delete(id: number) {
		const [ recipe ] = await db.delete(recipes)
			.where(eq(recipes.id, id))
			.returning()

		return recipe
	}
}
