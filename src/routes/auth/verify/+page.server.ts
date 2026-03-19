

import { redirect } from '@sveltejs/kit'
import { EmailVerification } from '$server/services'
import { zod4 } from 'sveltekit-superforms/adapters'
import { redirectToDestination } from '$scripts/flow'
import { emailverificationSchema } from '$validation/authSchemas'
import { message, superValidate } from 'sveltekit-superforms'
import { EMAIL_VERIFICATION_TIMEOUT_MS, validateToken } from '$server/scripts/auth'

import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ url, locals }) => {

	// Validate userstate
	if (locals.user === undefined || locals.user.verified) {
		redirect(303, '/')
	}

	return {
		verifyForm: await superValidate(zod4(emailverificationSchema))
	}
}

export const actions: Actions = {
	verify: async ({ request, url, locals }) => {
		const now = new Date()

		// Validate form
		const form = await superValidate(request, zod4(emailverificationSchema))
		if (!form.valid) return message(form, { type: 'error', text: 'Invalid form data' }, { status: 400 })

		// Validate userstate
		if (locals.user === undefined) return message(form, { type: 'error', text: 'Must be logged in to verify' }, { status: 401 })
		if (locals.user.verified) return message(form, { type: 'error', text: 'Already verified' }, { status: 403 })

		// Validate email verification
		const emailverification = await EmailVerification.getByUserId(locals.user.id)
		if (emailverification === undefined) return message(form, { type: 'error', text: 'Email verification not found' }, { status: 400 })

		if (now.getTime() - emailverification.createdAt.getTime() >= EMAIL_VERIFICATION_TIMEOUT_MS) {
			return message(form, { type: 'error', text: 'Email verification expired' }, { status: 400 })
		}

		const valid = await validateToken(form.data.code, emailverification.code)
		if (!valid) return message(form, { type: 'error', text: 'Incorrect code' }, { status: 400 })

		// Verify
		await EmailVerification.resolve(emailverification.id, emailverification.userId)

		// Redirect
		redirectToDestination(url, 303, '/')
	}
}