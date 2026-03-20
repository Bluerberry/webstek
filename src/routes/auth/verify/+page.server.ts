

import { redirect } from '@sveltejs/kit'
import { zod4 } from 'sveltekit-superforms/adapters'
import { redirectToDestination } from '$scripts/flow'
import { verifyCodeSchema } from '$validation/authSchemas'
import { EmailVerification, Session, User } from '$server/services'
import { message, superValidate } from 'sveltekit-superforms'
import { EMAIL_VERIFICATION_TIMEOUT_MS, validatePassword } from '$server/scripts/auth'

import type { PageServerLoad, Actions } from './$types'
import { db } from '$server/database'

export const load: PageServerLoad = async ({ locals }) => {

	// Validate userstate
	if (locals.user === undefined || locals.user.verified) {
		redirect(303, '/')
	}

	return {
		verifyForm: await superValidate(zod4(verifyCodeSchema))
	}
}

export const actions: Actions = {
	verify: async ({ request, url, locals }) => {
		const now = new Date()

		// Validate form
		const form = await superValidate(request, zod4(verifyCodeSchema))
		if (!form.valid) return message(form, { type: 'error', text: 'Invalid form data' }, { status: 400 })

		// Validate userstate
		if (locals.user === undefined || locals.session === undefined) {
			return message(form, { type: 'error', text: 'Must be logged in to verify' }, { status: 401 })
		}

		if (locals.user.verified) {
			return message(form, { type: 'error', text: 'Already verified' }, { status: 403 })
		}

		// Get email verification
		const emailverification = await EmailVerification.getByUserId(locals.user.id)
		if (!emailverification) {
			return message(form, { type: 'critical', text: 'Something went wrong' }, { status: 500 })
		}

		// Check expiry
		if (now.getTime() - emailverification.createdAt.getTime() >= EMAIL_VERIFICATION_TIMEOUT_MS) {
			return message(form, { type: 'error', text: 'Email verification expired' }, { status: 400 })
		}

		// Check code
		if (!await validatePassword(form.data.code, emailverification.code)) {
			return message(form, { type: 'error', text: 'Incorrect code' }, { status: 400 })
		}

		// Resolve
		const resolved = await EmailVerification.resolve(emailverification.id)
		if (!resolved) {
			return message(form, { type: 'error', text: 'Email verification expired' }, { status: 400 })
		}

		return message(form, { type: 'success' })
	}
}