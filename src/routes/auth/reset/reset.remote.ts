
import { command, getRequestEvent } from '$app/server'
import { User, PasswordReset } from '$server/services'
import { sendEmail, passwordResetTemplate } from '$server/scripts/email'
import { generateCode, hashPassword, PASSWORD_RESET_COOLDOWN_MS } from '$server/scripts/auth'

export const requestCode = command(async () => {
	const { cookies } = getRequestEvent()
	const now = Date.now()

	// Get email
	const email = cookies.get('webstek_reset_email')
	if (!email) return now + PASSWORD_RESET_COOLDOWN_MS

	// Get user
	const user = await User.getByEmail(email)
	if (!user) return now + PASSWORD_RESET_COOLDOWN_MS

	// Check cooldown
	const existing = await PasswordReset.getByUserId(user.id)

	if (existing) {
		const age = now - existing.createdAt.getTime()
		if (age < PASSWORD_RESET_COOLDOWN_MS) {
			return existing.createdAt.getTime() + PASSWORD_RESET_COOLDOWN_MS
		}
	}

	// Send new code
	const code = generateCode()
	const reset = await PasswordReset.upsert(user.id, await hashPassword(code))
	sendEmail(user.email, 'Webstek - Reset your password', passwordResetTemplate(user.username, code))
	return reset.createdAt.getTime() + PASSWORD_RESET_COOLDOWN_MS
})