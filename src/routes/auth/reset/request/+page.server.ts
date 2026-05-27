
import { isUser } from '$scripts/permissions'
import { redirectWithFlow } from '$scripts/flow'
import { zod4 } from 'sveltekit-superforms/adapters'
import { message, superValidate } from 'sveltekit-superforms'
import { PASSWORD_RESET_TIMEOUT_MS } from '$server/scripts/auth'
import { requestResetPasswordSchema } from '$validation/authSchemas'

import type { Cookies } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'

function setEmailCookie(url: URL, cookies: Cookies, email: string) {
	cookies.set('webstek_reset_email', email, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: true,
		maxAge: PASSWORD_RESET_TIMEOUT_MS / 1000
	})

	redirectWithFlow(url, 303, '/auth/reset/verify')
}

export const load: PageServerLoad = async event => {
	const { url, locals, cookies } = event

	// Check permissions
	if (isUser(locals)) {
		setEmailCookie(url, cookies, locals.user.email)
	}

	return {
		requestResetPasswordForm: await superValidate(zod4(requestResetPasswordSchema))
	}
}

export const actions: Actions = {
	request: async event => {
		const { request, url, locals, cookies } = event
		const form = await superValidate(request, zod4(requestResetPasswordSchema))
		if (!form.valid) return message(form, { type: 'error', text: 'Invalid form data' }, { status: 400 })

		// Set email cookie
		if (isUser(locals)) {
			setEmailCookie(url, cookies, locals.user.email)
		} else {
			setEmailCookie(url, cookies, form.data.email)
		}
	}
}