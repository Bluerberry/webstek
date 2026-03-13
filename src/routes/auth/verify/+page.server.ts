
import { EMAIL_VERIFICATION_TIMEOUT_MS, EMAIL_VERIFICATION_COOLDOWN_MS, validateToken, generateCode, hashToken } from '$server/scripts/auth'
import { message, superValidate } from 'sveltekit-superforms'
import { error, fail, redirect } from '@sveltejs/kit'
import { getFlowIntent, redirectToDestination } from '$lib/flow'
import { Verification } from '$server/services'
import { emailVerificationTemplate, sendEmail } from '$server/scripts/email'
import { verifySchema } from '$validation/authSchemas'
import { zod4 } from 'sveltekit-superforms/adapters'

import type { PageServerLoad, Actions } from './$types'

async function requestVerification(locals: App.Locals) {
	const now = Date.now()

	if (locals.user === undefined) throw error(401, 'Unauthorized')
	if (locals.user.verified) throw error(403, 'Forbidden')

	const existing = await Verification.getByUserId(locals.user.id)

	if (existing) {
		const age = now - existing.createdAt.getTime()
		if (age < EMAIL_VERIFICATION_COOLDOWN_MS) {
			return existing.createdAt.getTime() + EMAIL_VERIFICATION_COOLDOWN_MS
		}

		await Verification.delete(existing.id)
	}

	const code = generateCode()
	const verification = await Verification.create(locals.user.id, await hashToken(code))

	sendEmail(
		locals.user.email,
		'Verify your email',
		emailVerificationTemplate(locals.user.username, code)
	)

	return verification.createdAt.getTime() + EMAIL_VERIFICATION_COOLDOWN_MS
}

export const load: PageServerLoad = async ({ url, locals }) => {
	if (locals.user === undefined || locals.user.verified) {
		redirect(303, '/')
	}

	return {
		intent: getFlowIntent(url, 'register'),
		cooldown: await requestVerification(locals),
		verifyForm: await superValidate(zod4(verifySchema))
	}
}

export const actions: Actions = {
	verify: async ({ request, url, locals }) => {
		const now = new Date()

		const form = await superValidate(request, zod4(verifySchema))
		if (!form.valid) return message(form, 'Invalid form data', { status: 400 })

		if (locals.user === undefined) return message(form, 'Must be logged in to verify', { status: 401 })
		if (locals.user.verified) return message(form, 'Already verified', { status: 403 })

		const verification = await Verification.getByUserId(locals.user.id)
		if (verification === undefined) return message(form, 'Verification not found', { status: 400 })

		if (now.getTime() - verification.createdAt.getTime() >= EMAIL_VERIFICATION_TIMEOUT_MS) {
			return message(form, 'Verification expired', { status: 400 })
		}

		const valid = await validateToken(form.data.code, verification.code)
		if (!valid) return message(form, 'Incorrect code', { status: 400 })

		Verification.resolve(verification.id, verification.userId)
		redirectToDestination(url, 303, '/')
	},

	resend: async ({ locals }) => {
		if (locals.user === undefined) return fail(401)
		await requestVerification(locals)
	}
}