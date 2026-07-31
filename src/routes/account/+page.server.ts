
import { redirect } from '@sveltejs/kit'
import { SessionService, UserService } from '$server/services'
import { flashToast } from '$server/scripts/flash'
import { zod4 } from 'sveltekit-superforms/adapters'
import { createFlow, withFlow } from '$scripts/flow'
import { requireUser } from '$server/scripts/permissions'
import { isUser, isVerified } from '$scripts/permissions'
import { message, superValidate } from 'sveltekit-superforms'
import { hashPassword, validatePassword } from '$server/scripts/auth'
import { changeUsernameSchema, changeEmailSchema, changePasswordSchema } from '$validation/authSchemas'
import { sendEmail, emailChangeNotificationTemplate, passwordChangeNotificationTemplate } from '$server/scripts/email'

import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async event => {
	
	// Check permissions
	requireUser(event)

	return {
		user: event.locals.user,
		session: event.locals.session,
		changeUsernameForm: await superValidate(zod4(changeUsernameSchema)),
		changeEmailForm: await superValidate(zod4(changeEmailSchema)),
		changePasswordForm: await superValidate(zod4(changePasswordSchema))
	}
}

export const actions: Actions = {
	'change-username': async ({ request, locals, cookies }) => {

		// Validate form
		const form = await superValidate(request, zod4(changeUsernameSchema))
		if (!form.valid) return message(form, { type: 'error', text: 'Invalid form data' }, { status: 400 })

		// Check permissions
		if (!isVerified(locals)) {
			return message(form, { type: 'error', text: 'You must be verified' }, { status: 401 })
		}

		// Update username
		await UserService.update({ id: locals.user.id, username: form.data.newUsername })
		flashToast(cookies, 'Successfully changed username')
	},

	'change-email': async ({ request, locals, cookies }) => {

		// Validate form
		const form = await superValidate(request, zod4(changeEmailSchema))
		if (!form.valid) return message(form, { type: 'error', text: 'Invalid form data' }, { status: 400 })

		// Check permissions
		if (!isUser(locals)) {
			return message(form, { type: 'error', text: 'You must be logged in' }, { status: 401 })
		}

		// Get user
		const user = await UserService.getById(locals.user.id)
		if (user === undefined) {
			return message(form, { type: 'critical', text: 'Something went wrong' }, { status: 500 })
		}

		// Validate password
		if (!await validatePassword(form.data.password, user.password)) {
			return message(form, { type: 'error', text: 'Invalid credentials' }, { status: 401 })
		}

		// Update email
		try {
			await UserService.update({ id: locals.user.id, email: form.data.newEmail, verified: false })
		} catch (error: any) {
			if (error.code === '23505') { // Postgres unique violation
				return message(form, { type: 'error', text: 'Email already exists' }, { status: 400 })
			}

			throw error
		}

		await SessionService.deleteAllExceptCurrent(user.id, locals.session.id)

		// Send notification
		sendEmail(
			locals.user.email,
			'Webstek - Your email has been changed',
			emailChangeNotificationTemplate(locals.user.username)
		)

		// Redirect to email verification
		flashToast(cookies, 'Sucessfully changed email', 'Make sure to verify to regain access to all of Webstek')
		redirect(303, withFlow('/auth/verify', createFlow('verify', '/account')))
	},

	'change-password': async ({ request, locals, cookies }) => {

		// Validate form
		const form = await superValidate(request, zod4(changePasswordSchema))
		if (!form.valid) return message(form, { type: 'error', text: 'Invalid form data' }, { status: 400 })

		// Check permissions
		if (!isVerified(locals)) {
			return message(form, { type: 'error', text: 'You must be verified' }, { status: 401 })
		}

		// Get user
		const user = await UserService.getById(locals.user.id)
		if (user === undefined) {
			return message(form, { type: 'critical', text: 'Something went wrong' }, { status: 500 })
		}

		// Validate password
		if (!await validatePassword(form.data.oldPassword, user.password)) {
			return message(form, { type: 'error', text: 'Invalid credentials' }, { status: 401 })
		}

		// Update password
		await UserService.update({
			id: locals.user.id,
			password: await hashPassword(form.data.newPassword)
		})

		// Send notification
		sendEmail(
			locals.user.email,
			'Webstek - Your password has been changed',
			passwordChangeNotificationTemplate(locals.user.username)
		)

		flashToast(cookies, 'Successfully changed password')
	}
}