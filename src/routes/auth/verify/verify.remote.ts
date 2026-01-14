
import { error } from '@sveltejs/kit'
import { Verification } from '$server/services'
import { command, getRequestEvent } from '$app/server'
import { emailVerificationTemplate, sendEmail } from '$server/scripts/email'

import { 
	EMAIL_VERIFICATION_TIMEOUT_MS,
	generateCode,
	hashToken
} from '$server/scripts/auth'

export const requestVerification = command(async () => {
	const now = new Date()

	// Check if logged in
	const { locals } = getRequestEvent()
	if (locals.user === undefined) {
		throw error(401, 'Unauthorized')
	}

	// Check if already verified
	if (locals.user.verified) {
		throw error(403, 'Forbidden')
	}

	// Check for existing verification
	const existing = await Verification.getByUserId(locals.user.id)
	if (existing) {

		// Check if verification is expired
		if (now.getTime() - existing.createdAt.getTime() >= EMAIL_VERIFICATION_TIMEOUT_MS) {
			await Verification.delete(existing.id)
		} else {
			return
		}
	}

	// Create verification
	const verificationCode = generateCode()
	await Verification.create(locals.user.id, await hashToken(verificationCode))

	// Send email
	sendEmail(
		locals.user.email,
		'Verify your email',
		emailVerificationTemplate(
			locals.user.username, 
			verificationCode
		)
	)
})