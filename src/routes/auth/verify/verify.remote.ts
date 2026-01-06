
import z from 'zod'
import { command } from '$app/server'
import { Verification } from '$server/services'
import { sendEmail } from '$server/scripts/email'

import { 
	generateCode,
	EMAIL_VERIFICATION_TIMEOUT_MS,
	hashToken
} from '$server/scripts/auth'

export const requestVerification = command(z.number(), async (userId: number) => {
	const now = new Date()

	// Check for existing verification
	const existing = await Verification.getByUserId(userId)
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
	await Verification.create(userId, await hashToken(verificationCode))

	// TODO Send Email
})