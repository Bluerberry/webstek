
import { flashToast } from '$server/scripts/flash'
import { zod4 } from 'sveltekit-superforms/adapters'
import { resetPasswordSchema } from '$validation/authSchemas'
import { message, superValidate } from 'sveltekit-superforms'
import { User, Session, PasswordReset } from '$server/services'
import { redirectToDestination, redirectWithFlow } from '$scripts/flow'
import { sendEmail, passwordChangeNotificationTemplate } from '$server/scripts/email'
import { hashPassword, PASSWORD_RESET_TIMEOUT_MS, validatePassword } from '$server/scripts/auth'

import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async () => {
	return {
		resetPasswordForm: await superValidate(zod4(resetPasswordSchema))
	}
}

export const actions: Actions = {
	resolve: async ({ url, request, locals, cookies }) => {
		const form = await superValidate(request, zod4(resetPasswordSchema))
		if (!form.valid) return message(form, { type: 'error', text: 'Invalid form data' }, { status: 400 })

		// Get cookies
		const email = cookies.get('webstek_reset_email')
		if (!email) return message(form, { type: 'critical', text: 'Something went wrong' }, { status: 500 })
		const code = cookies.get('webstek_reset_code')
		if (!code) return message(form, { type: 'critical', text: 'Something went wrong' }, { status: 500 })

		// Get user
		const user = await User.getByEmail(email)
		if (!user) return message(form, { type: 'critical', text: 'Something went wrong' }, { status: 500 })

		// Get password reset
		const passwordReset = await PasswordReset.getByUserId(user.id, false)
		if (!passwordReset) {
			return message(form, { type: 'critical', text: 'Something went wrong' }, { status: 500 })
		}

		// Check expiry
		if (Date.now() - passwordReset.createdAt.getTime() >= PASSWORD_RESET_TIMEOUT_MS) {
			return message(form, { type: 'error', text: 'Reset request expired' }, { status: 400 })
		}

		// Check code
		if (!await validatePassword(code, passwordReset.code)) {
			return message(form, { type: 'critical', text: 'Something went wrong' }, { status: 500 })
		}

		// Resolve
		const resolved = await PasswordReset.resolve(
			passwordReset.id,
			await hashPassword(form.data.newPassword)
		)

		if (!resolved) {
			return message(form, { type: 'error', text: 'Reset request expired' }, { status: 400 })
		}

		// Cleanup
		if (locals.session) {
			await Session.deleteAllExceptCurrent(user.id, locals.session.id)
		} else {
			await Session.deleteByUserId(user.id)
		}

		cookies.delete('webstek_reset_email', { path: '/' })
		cookies.delete('webstek_reset_code', { path: '/' })

		sendEmail(
			user.email, 
			'Webstek - Your password has been changed', 
			passwordChangeNotificationTemplate(user.username)
		)

		flashToast(cookies, 'Successfully reset password')

		if (locals.session) {
			redirectToDestination(url, 303, '/')
		} else {
			redirectWithFlow(url, 303, '/auth/login')
		}
	}
}