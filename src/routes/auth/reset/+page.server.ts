
import { zod4 } from 'sveltekit-superforms/adapters'
import { message, superValidate } from 'sveltekit-superforms'
import { User, Session, PasswordReset } from '$server/services'
import { sendEmail, passwordChangeNotificationTemplate } from '$server/scripts/email'
import { validateToken, hashPassword, PASSWORD_RESET_TIMEOUT_MS } from '$server/scripts/auth'
import { requestResetSchema, verifyResetSchema, resetPasswordSchema } from '$validation/authSchemas'

import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async () => {
    return {
        requestResetForm: await superValidate(zod4(requestResetSchema)),
        verifyResetForm: await superValidate(zod4(verifyResetSchema)),
        resetPasswordForm: await superValidate(zod4(resetPasswordSchema))
    }
}

export const actions: Actions = {
	request: async ({ request }) => {
		const form = await superValidate(request, zod4(requestResetSchema))
		if (!form.valid) return message(form, { type: 'error', text: 'Invalid form data' }, { status: 400 })
		return message(form, { type: 'success' })
	},

	verify: async ({ request }) => {
		const form = await superValidate(request, zod4(verifyResetSchema))
		if (!form.valid) return message(form, { type: 'error', text: 'Invalid form data' }, { status: 400 })

		// Get user
		const user = await User.getByEmail(form.data.email)
		if (!user) return message(form, { type: 'error', text: 'Invalid form data' }, { status: 400 })

		// Get reset
		const reset = await PasswordReset.getByUserId(user.id)
		if (!reset) return message(form, { type: 'error', text: 'Failed to find reset request' }, { status: 500 })

		// Check expiry
		if (Date.now() - reset.createdAt.getTime() >= PASSWORD_RESET_TIMEOUT_MS) {
			await PasswordReset.delete(reset.id)
			return message(form,{ type: 'error', text: 'Reset code expired' }, { status: 400 })
		}

		// Check code
		if (!await validateToken(form.data.code, reset.code)) {
			return message(form, { type: 'error', text: 'Incorrect code' }, { status: 400 })
		}

		return message(form, { type: 'success' })
	},

	reset: async ({ url, request }) => {
		const form = await superValidate(request, zod4(resetPasswordSchema))
		if (!form.valid) return message(form, { type: 'error', text: 'Invalid form data' }, { status: 400 })

		// Get user
		const user = await User.getByEmail(form.data.email)
		if (!user) return message(form, { type: 'error', text: 'Invalid form data' }, { status: 400 })

		// Get reset
		const reset = await PasswordReset.getByUserId(user.id)
		if (!reset) return message(form, { type: 'error', text: 'Failed to find reset request' }, { status: 500 })

		// Re-check expiry
		if (Date.now() - reset.createdAt.getTime() >= PASSWORD_RESET_TIMEOUT_MS) {
			await PasswordReset.deleteAllByUserId(user.id)
			return message(form, { type: 'error', text: 'Reset code expired' }, { status: 400 })
		}

		// Re-check code
		if (!await validateToken(form.data.code, reset.code)) {
			return message(form, { type: 'error', text: 'Invalid form data' }, { status: 400 })
		}

		// Update password
		user.password = await hashPassword(form.data.newPassword)
		await User.update(user)

		// Cleanup - Invalidate all sessions
		await Session.deleteAllByUserId(user.id)
		await PasswordReset.deleteAllByUserId(user.id)

		sendEmail(
			user.email, 
			'Webstek - Your password has been changed', 
			passwordChangeNotificationTemplate(user.username)
		)

		return message(form, { type: 'success' })
	}
}