
import { redirectWithFlow } from '$scripts/flow'
import { zod4 } from 'sveltekit-superforms/adapters'
import { UserService, PasswordResetService } from '$server/services'
import { message, superValidate } from 'sveltekit-superforms'
import { verifyCodeSchema } from '$validation/authSchemas'
import { PASSWORD_RESET_TIMEOUT_MS, validatePassword } from '$server/scripts/auth'

import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async () => {
	return {
		verifyCodeForm: await superValidate(zod4(verifyCodeSchema))
	}
}

export const actions: Actions = {
	verify: async ({ url, request, cookies }) => {
		const form = await superValidate(request, zod4(verifyCodeSchema))
		if (!form.valid) return message(form, { type: 'error', text: 'Invalid form data' }, { status: 400 })

		// Get cookies
		const email = cookies.get('webstek_reset_email')
		if (!email) return message(form, { type: 'critical', text: 'Something went wrong' }, { status: 500 })

		// Get user
		const user = await UserService.getByEmail(email)
		if (!user) return message(form, { type: 'critical', text: 'Something went wrong' }, { status: 500 })

		// Get reset
		const reset = await PasswordResetService.getByUserId(user.id)
		if (!reset) return message(form, { type: 'critical', text: 'Something went wrong' }, { status: 500 })

		// Check expiry
		if (Date.now() - reset.createdAt.getTime() >= PASSWORD_RESET_TIMEOUT_MS) {
			return message(form,{ type: 'error', text: 'Reset request expired' }, { status: 400 })
		}

		// Check code
		if (!await validatePassword(form.data.code, reset.code)) {
			return message(form, { type: 'error', text: 'Incorrect code' }, { status: 400 })
		}

		// Update cookies
		cookies.set('webstek_reset_code', form.data.code, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: true,
			maxAge: PASSWORD_RESET_TIMEOUT_MS / 1000
		})

		redirectWithFlow(url, 303, '/auth/reset/resolve')
	}
}