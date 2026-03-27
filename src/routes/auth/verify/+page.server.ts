

import { flashToast } from '$server/scripts/flash'
import { zod4 } from 'sveltekit-superforms/adapters'
import { EmailVerification } from '$server/services'
import { verifyCodeSchema } from '$validation/authSchemas'
import { message, superValidate } from 'sveltekit-superforms'
import { getFlow, redirectToDestination } from '$scripts/flow'
import { isUnverified, isUser, requireUnverified } from '$server/scripts/permissions'
import { EMAIL_VERIFICATION_TIMEOUT_MS, validatePassword } from '$server/scripts/auth'

import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async event => {
	
	// Check permissions
	requireUnverified(event)

	return {
		verifyForm: await superValidate(zod4(verifyCodeSchema))
	}
}

export const actions: Actions = {
	verify: async ({ request, url, locals, cookies }) => {
		const now = new Date()

		// Validate form
		const form = await superValidate(request, zod4(verifyCodeSchema))
		if (!form.valid) return message(form, { type: 'error', text: 'Invalid form data' }, { status: 400 })

		// Check permissions
		if (!isUser(locals) ) {
			return message(form, { type: 'error', text: 'Must be logged in to verify' }, { status: 401 })
		}

		if (!isUnverified(locals)) {
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

		const { intent } = getFlow(url)
		if (intent === 'register') {
			flashToast(cookies, 'Welcome ' + locals.user.username, 'You successfully registered and verified your new account')
		} else {
			flashToast(cookies, 'Successfully verified email')
		}

		redirectToDestination(url, 303, '/')
	}
}