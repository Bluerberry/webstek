
import { redirectWithFlow } from '$scripts/flow'
import { zod4 } from 'sveltekit-superforms/adapters'
import { message, superValidate } from 'sveltekit-superforms'
import { PASSWORD_RESET_TIMEOUT_MS } from '$server/scripts/auth'
import { requestResetPasswordSchema } from '$validation/authSchemas'

import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ url, locals, cookies }) => {
	if (locals.user !== undefined) {
		cookies.set('webstek_reset_email', locals.user.email, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: true,
			maxAge: PASSWORD_RESET_TIMEOUT_MS / 1000
		})

		redirectWithFlow(url, 303, '/auth/reset/verify')
	}

	return {
		requestResetPasswordForm: await superValidate(zod4(requestResetPasswordSchema))
	}
}

export const actions: Actions = {
	request: async ({ url, request, cookies }) => {
		const form = await superValidate(request, zod4(requestResetPasswordSchema))
		if (!form.valid) return message(form, { type: 'error', text: 'Invalid form data' }, { status: 400 })

		// Update cookies
		cookies.set('webstek_reset_email', form.data.email, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: true,
			maxAge: PASSWORD_RESET_TIMEOUT_MS / 1000
		})

		redirectWithFlow(url, 303, '/auth/reset/verify')
	}
}