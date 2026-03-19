
import { User } from '$server/services'
import { redirect } from '@sveltejs/kit'
import { startFlow } from '$scripts/flow'
import { zod4 } from 'sveltekit-superforms/adapters'
import { message, superValidate } from 'sveltekit-superforms'
import { hashPassword, validatePassword } from '$server/scripts/auth'
import { changeUsernameSchema, changeEmailSchema, changePasswordSchema } from '$validation/authSchemas'
import { sendEmail, emailChangeNotificationTemplate, passwordChangeNotificationTemplate } from '$server/scripts/email'

import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ url, locals }) => {

	// Validate userstate
	if (locals.user === undefined || locals.session === undefined) {
		redirect(303, '/auth/login?' + startFlow('login', '/account'))
	}

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
		locals.user.username = form.data.newUsername
		await User.update(locals.user)
	},

	'change-email': async ({ request, locals }) => {

		// Validate form
		const form = await superValidate(request, zod4(changeEmailSchema))
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
		if (!await validatePassword(form.data.password, user.password)) {
			return message(form, { type: 'error', text: 'Invalid credentials' }, { status: 401 })
		}

		// Send notification
		sendEmail(
			locals.user.email,
			'Webstek - Your email has been changed',
			emailChangeNotificationTemplate(locals.user.username)
		)

		// Update email
		locals.user.email = form.data.newEmail
		locals.user.verified = false
		await User.update(locals.user)

		// Redirect to verification
		redirect(303, '/auth/verify?' + startFlow('update', '/account'))
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

		// Send notification
		sendEmail(
			locals.user.email,
			'Webstek - Your password has been changed',
			passwordChangeNotificationTemplate(locals.user.username)
		)

		// Update password
		await User.update({
			id: locals.user.id,
			password: await hashPassword(form.data.newPassword)
		})
	}
}