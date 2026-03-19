

import { fail, redirect } from '@sveltejs/kit'
import { Verification } from '$server/services'
import { zod4 } from 'sveltekit-superforms/adapters'
import { verificationSchema } from '$validation/authSchemas'
import { message, superValidate } from 'sveltekit-superforms'
import { getFlow, redirectToDestination } from '$scripts/flow'
import { emailVerificationTemplate, emailUpdateVerificationTemplate, sendEmail } from '$server/scripts/email'
import { EMAIL_VERIFICATION_TIMEOUT_MS, EMAIL_VERIFICATION_COOLDOWN_MS, validateToken, generateCode, hashToken } from '$server/scripts/auth'

import type { FlowIntent } from '$scripts/flow'
import type { PageServerLoad, Actions } from './$types'

async function requestVerification(userId: number, userEmail: string, username: string, intent: FlowIntent | undefined) {
	const now = Date.now()

	// Check cooldown
	const existing = await Verification.getByUserId(userId)

	if (existing) {
		const age = now - existing.createdAt.getTime()
		if (age < EMAIL_VERIFICATION_COOLDOWN_MS) {
			return existing.createdAt.getTime() + EMAIL_VERIFICATION_COOLDOWN_MS
		}

		await Verification.delete(existing.id)
	}

	// Create verification
	const code = generateCode()
	const verification = await Verification.create(userId, await hashToken(code))

	// Send email
	const template = intent === 'verify'
		? emailUpdateVerificationTemplate(username, code)
		: emailVerificationTemplate(username, code)

	sendEmail(
		userEmail, 
		'Webstek - Verify your email', 
		template
	)

	return verification.createdAt.getTime() + EMAIL_VERIFICATION_COOLDOWN_MS
}

export const load: PageServerLoad = async ({ url, locals }) => {

	// Validate userstate
	if (locals.user === undefined || locals.user.verified) {
		redirect(303, '/')
	}

	const cooldown = await requestVerification(
		locals.user.id, 
		locals.user.email, 
		locals.user.username, 
		getFlow(url).intent
	)

	return {
		cooldown: cooldown,
		verifyForm: await superValidate(zod4(verificationSchema))
	}
}

export const actions: Actions = {
	verify: async ({ request, url, locals }) => {
		const now = new Date()

		// Validate form
		const form = await superValidate(request, zod4(verificationSchema))
		if (!form.valid) return message(form, { type: 'error', text: 'Invalid form data' }, { status: 400 })

		// Validate userstate
		if (locals.user === undefined) return message(form, { type: 'error', text: 'Must be logged in to verify' }, { status: 401 })
		if (locals.user.verified) return message(form, { type: 'error', text: 'Already verified' }, { status: 403 })

		// Validate verification
		const verification = await Verification.getByUserId(locals.user.id)
		if (verification === undefined) return message(form, { type: 'error', text: 'Verification not found' }, { status: 400 })

		if (now.getTime() - verification.createdAt.getTime() >= EMAIL_VERIFICATION_TIMEOUT_MS) {
			return message(form, { type: 'error', text: 'Verification expired' }, { status: 400 })
		}

		const valid = await validateToken(form.data.code, verification.code)
		if (!valid) return message(form, { type: 'error', text: 'Incorrect code' }, { status: 400 })

		// Verify
		await Verification.resolve(verification.id, verification.userId)

		// Redirect
		redirectToDestination(url, 303, '/')
	},

	resend: async ({ url, locals }) => {

		// Validate userstate
		if (locals.user === undefined) return fail(401)

		// Resend
		await requestVerification(
			locals.user.id, 
			locals.user.email, 
			locals.user.username, 
			getFlow(url).intent
		)
	}
}