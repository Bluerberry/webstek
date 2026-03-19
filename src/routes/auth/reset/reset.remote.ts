
import { z } from 'zod'
import { command } from '$app/server'
import { User, PasswordReset } from '$server/services'
import { sendEmail, passwordResetTemplate } from '$server/scripts/email'
import { generateCode, hashToken, PASSWORD_RESET_COOLDOWN_MS } from '$server/scripts/auth'

export const requestCode = command(
	z.string().email(),
	async (email: string) => {
		const user = await User.getByEmail(email)
		if (!user) return null

		const existing = await PasswordReset.getByUserId(user.id)
		if (existing) {
			const age = Date.now() - existing.createdAt.getTime()
			if (age < PASSWORD_RESET_COOLDOWN_MS) {
				return existing.createdAt.getTime() + PASSWORD_RESET_COOLDOWN_MS
			}
			await PasswordReset.deleteAllByUserId(user.id)
		}

		const code = generateCode()
		const reset = await PasswordReset.create(user.id, await hashToken(code))
		sendEmail(user.email, 'Webstek - Reset your password', passwordResetTemplate(user.username, code))
		return reset.createdAt.getTime() + PASSWORD_RESET_COOLDOWN_MS
	}
)