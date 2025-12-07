
import { redirect } from '@sveltejs/kit'
import { zod4 } from 'sveltekit-superforms/adapters'
import { verifySchema } from '$lib/schemas/authSchemas'
import { message, superValidate } from 'sveltekit-superforms'
import { EMAIL_VERIFICATION_TIMEOUT_MS, validateToken } from '$lib/server/scripts/auth'
import { Verification, Flow } from '$lib/server/services'
import { requestVerification } from './verify.remote'

import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ locals, url }) => {

	// Validate userstate
	if (locals.user === undefined || locals.user.verified) {
		const status = locals.user === undefined ? 401 : 403
		if (locals.flow === undefined) redirect(status, '/')
		await Flow.delete(locals.flow.id)
		redirect(status, locals.flow.redirect)
	}

	// Request verification
	await requestVerification(locals.user.id)

	return {
		verifyForm: await superValidate(zod4(verifySchema))
	}
}

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const now = new Date()
		
		// Validate form
		const form = await superValidate(request, zod4(verifySchema))
		if (!form.valid) return message(form, 'Invalid form data', { status: 400 })

		// Validate userstate
		if (locals.user === undefined) {
			return message(form, 'Must be logged in to verify', { status: 401 })
		} if (locals.user.verified) {
			return message(form, 'Must be unverified to verify', { status: 403 })
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
		
		// Redirect appropriately
		if (locals.flow === undefined) redirect(303, '/')
		await Flow.delete(locals.flow.id)
		redirect(303, locals.flow.redirect)
	}
}