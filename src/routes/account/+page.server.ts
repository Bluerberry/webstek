
import { redirect } from '@sveltejs/kit'
import { Session, User } from '$server/services'
import { zod4 } from 'sveltekit-superforms/adapters'
import { message, superValidate } from 'sveltekit-superforms'
import { createFlow, requireAuth, withFlow } from '$scripts/flow'
import { hashPassword, validatePassword } from '$server/scripts/auth'
import { changeUsernameSchema, changeEmailSchema, changePasswordSchema } from '$validation/authSchemas'
import { sendEmail, emailChangeNotificationTemplate, passwordChangeNotificationTemplate } from '$server/scripts/email'

import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ url, locals }) => {
	requireAuth(url, locals)

	return {
		user: locals.user,
		session: locals.session,
		changeUsernameForm: await superValidate(zod4(changeUsernameSchema)),
		changeEmailForm: await superValidate(zod4(changeEmailSchema)),
		changePasswordForm: await superValidate(zod4(changePasswordSchema))
	}
}

export const actions: Actions = {
	'change-username': async ({ request, locals }) => {

		// Validate form
		const form = await superValidate(request, zod4(changeUsernameSchema))
		if (!form.valid) return message(form, { type: 'error', text: 'Invalid form data' }, { status: 400 })

		// Validate userstate
		if (locals.user === undefined) {
			return message(form, { type: 'error', text: 'You are not logged in' }, { status: 401 })
		}

		// Update username
		await User.update({ id: locals.user.id, username: form.data.newUsername })
	},

	'change-email': async ({ request, locals }) => {

		// Validate form
		const form = await superValidate(request, zod4(changeEmailSchema))
		if (!form.valid) return message(form, { type: 'error', text: 'Invalid form data' }, { status: 400 })

		// Validate userstate
		if (locals.user === undefined || locals.session === undefined) {
			return message(form, { type: 'error', text: 'You are not logged in' }, { status: 401 })
		}

		// Get user
		const user = await User.getById(locals.user.id)
		if (user === undefined) {
			return message(form, { type: 'error', text: 'Failed to find user' }, { status: 500 })
		}

		// Validate password
		if (!await validatePassword(form.data.password, user.password)) {
			return message(form, { type: 'error', text: 'Invalid credentials' }, { status: 401 })
		}

		// Update email
		try {
			await User.update({ id: locals.user.id, email: form.data.newEmail, verified: false })
		} catch (error: any) {
			if (error.code === '23505') { // Postgress unique violation
				return message(form, { type: 'error', text: 'Email already exists' }, { status: 400 })
			}

			throw error
		}

		await Session.deleteAllExceptCurrent(user.id, locals.session.id)

		// Send notification
		sendEmail(
			locals.user.email,
			'Webstek - Your email has been changed',
			emailChangeNotificationTemplate(locals.user.username)
		)

		// Redirect to email verification
		redirect(303, withFlow('/auth/verify', createFlow('verify', '/account')))
	},

	'change-password': async ({ request, locals }) => {

		// Validate form
		const form = await superValidate(request, zod4(changePasswordSchema))
		if (!form.valid) return message(form, { type: 'error', text: 'Invalid form data' }, { status: 400 })

		// Validate userstate
		if (locals.user === undefined) {
			return message(form, { type: 'error', text: 'You are not logged in' }, { status: 401 })
		}

		// Get user
		const user = await User.getById(locals.user.id)
		if (user === undefined) {
			return message(form, { type: 'error', text: 'Failed to find user' }, { status: 500 })
		}

		// Validate password
		if (!await validatePassword(form.data.oldPassword, user.password)) {
			return message(form, { type: 'error', text: 'Invalid credentials' }, { status: 401 })
		}

		// Update password
		await User.update({
			id: locals.user.id,
			password: await hashPassword(form.data.newPassword)
		})

		// Send notification
		sendEmail(
			locals.user.email,
			'Webstek - Your password has been changed',
			passwordChangeNotificationTemplate(locals.user.username)
		)
	}
}