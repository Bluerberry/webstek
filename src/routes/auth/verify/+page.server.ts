
import { EMAIL_VERIFICATION_TIMEOUT_MS, validateToken } from '$server/scripts/auth'
import { message, superValidate } from 'sveltekit-superforms'
import { redirect } from '@sveltejs/kit'
import { getFlowIntent, redirectToDestination } from '$server/scripts/flow'
import { requestVerification } from './verify.remote'
import { Verification } from '$server/services'
import { verifySchema } from '$validation/authSchemas'
import { zod4 } from 'sveltekit-superforms/adapters'

import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ url, locals }) => {

	// Validate userstate
	if (locals.user === undefined || locals.user.verified) {
		redirect(303, '/')
	}

	// Request verification
	await requestVerification()

	return {
		intent: getFlowIntent(url, 'register'),
		verifyForm: await superValidate(zod4(verifySchema))
	}
}

export const actions: Actions = {
	default: async ({ request, url, locals }) => {
		const now = new Date()
		
		// Validate form
		const form = await superValidate(request, zod4(verifySchema))
		if (!form.valid) return message(form, 'Invalid form data', { status: 400 })

		// Validate userstate
		if (locals.user === undefined) {
			return message(form, 'Must be logged in to verify', { status: 401 })
		} if (locals.user.verified) {
			return message(form, 'Already verified', { status: 403 })
		}

		// Get verification
		const verification = await Verification.getByUserId(locals.user.id)
		if (verification === undefined) {
			return message(form, 'Verification not found', { status: 400 })
		}

		// Validate timeout
		if (now.getTime() - verification.createdAt.getTime() >= EMAIL_VERIFICATION_TIMEOUT_MS) {
			return message(form, 'Verification expired', { status: 400 })
		}

		// Validate code
		const valid = await validateToken(form.data.code, verification.code)
		if (!valid) return message(form, 'Incorrect code', { status: 400 })

		// Resolve verification
		Verification.resolve(
			verification.id, 
			verification.userId
		)
		
		// Redirect
		redirectToDestination(url, 303, '/')
	}
}