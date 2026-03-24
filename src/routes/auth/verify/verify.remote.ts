
import { z } from 'zod'
import { error } from '@sveltejs/kit'
import { command } from '$app/server'
import { getRequestEvent } from '$app/server'
import { EmailVerification } from '$server/services'
import { isLoggedIn } from '$server/scripts/permissions'
import { EMAIL_VERIFICATION_COOLDOWN_MS, generateCode, hashPassword } from '$server/scripts/auth'
import { sendEmail, emailVerificationTemplate, emailUpdateVerificationTemplate } from '$server/scripts/email'

export const requestCode = command(z.string().optional(), async intent => {
	const { locals } = getRequestEvent()
	const now = Date.now()

	// Get User
	if (!isLoggedIn(locals) || locals.user.verified) {
		throw error(401, 'Unauthorized')
	}

	// Check cooldown
	const existing = await EmailVerification.getByUserId(locals.user.id)

	if (existing) {
		const age = now - existing.createdAt.getTime()
		if (age < EMAIL_VERIFICATION_COOLDOWN_MS) {
			return existing.createdAt.getTime() + EMAIL_VERIFICATION_COOLDOWN_MS
		}
	}

	// Send new code
	const code = generateCode()
	const emailverification = await EmailVerification.upsert(locals.user.id, await hashPassword(code))
	const template = intent === 'verify'
		? emailUpdateVerificationTemplate(locals.user.username, code)
		: emailVerificationTemplate(locals.user.username, code)

	sendEmail(locals.user.email, 'Webstek - Verify your email', template)
	return emailverification.createdAt.getTime() + EMAIL_VERIFICATION_COOLDOWN_MS
})