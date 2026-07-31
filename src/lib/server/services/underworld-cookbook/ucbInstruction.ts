import { and, eq } from 'drizzle-orm'
import { db, ucbInstructions } from '$server/database'

import type { DbOrTx } from '$server/database'
import type { SanitizedInstruction } from '$scripts/types'

type TInstruction = typeof ucbInstructions.$inferSelect

export class UcbInstructionService {
    static async getForRecipe(recipeId: number, dbOrTx: DbOrTx = db) {
        return await dbOrTx.query.ucbInstructions.findMany({
            where: eq(ucbInstructions.recipeId, recipeId)
        })
    }

    static async create(data: TInstruction, dbOrTx: DbOrTx = db) {
        const [instruction] = await dbOrTx.insert(ucbInstructions)
            .values(data)
            .returning()

        return instruction
    }

    static async update(recipeId: number, index: number, text: string, dbOrTx: DbOrTx = db) {
        const [instruction] = await dbOrTx.update(ucbInstructions)
            .set({ text })
            .where(and(
                eq(ucbInstructions.recipeId, recipeId),
                eq(ucbInstructions.index, index)
            ))
            .returning()

        return instruction
    }

    static async delete(recipeId: number, index: number, dbOrTx: DbOrTx = db) {
        const [instruction] = await dbOrTx.delete(ucbInstructions)
            .where(and(
                eq(ucbInstructions.recipeId, recipeId),
                eq(ucbInstructions.index, index)
            ))
            .returning()

        return instruction
    }

    static sanitize(instruction: TInstruction): SanitizedInstruction {
        return {
            index: instruction.index,
            text: instruction.text
        }
    }
}