
import { redirect } from '@sveltejs/kit'
import { zod4 } from 'sveltekit-superforms/adapters'
import { message, superValidate } from 'sveltekit-superforms'
import { changeUsernameSchema, changeEmailSchema, changePasswordSchema } from '$validation/authSchemas'
import { hashPassword, validatePassword } from '$server/scripts/auth'
import { startFlow } from '$lib/flow'
import { User } from '$server/services'

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
		if (!form.valid) return message(form, 'Invalid form data', { status: 400 })

		// Validate userstate
		if (locals.user === undefined) {
			return message(form, 'You are not logged in', { status: 401 })
		}

		// Update username
		locals.user.username = form.data.username
		await User.update(locals.user)
	},

	'change-email': async ({ request, locals }) => {

		// Validate form
		const form = await superValidate(request, zod4(changeEmailSchema))
		if (!form.valid) return message(form, 'Invalid form data', { status: 400 })

		// Validate userstate
		if (locals.user === undefined) {
			return message(form, 'You are not logged in', { status: 401 })
		}

		// Get user
		const user = await User.getById(locals.user.id)
		if (user === undefined) {
			return message(form, 'Server Error - Failed to find user', { status: 500 })
		}
	
		// Validate password
		if (!await validatePassword(form.data.password, user.password)) {
			return message(form, 'Invalid credentials', { status: 401 })
		}

		// Update email
		locals.user.email = form.data.email
		locals.user.verified = false
		await User.update(locals.user)

		// Redirect to verification
		redirect(303, '/auth/verify')
	},

	'change-password': async ({ request, locals }) => {

		// Validate form
		const form = await superValidate(request, zod4(changePasswordSchema))
		if (!form.valid) return message(form, 'Invalid form data', { status: 400 })

		// Validate userstate
		if (locals.user === undefined) {
			return message(form, 'You are not logged in', { status: 401 })
		}

		// Get user
		const user = await User.getById(locals.user.id)
		if (user === undefined) {
			return message(form, 'Server Error - Failed to find user', { status: 500 })
		}
	
		// Validate password
		if (!await validatePassword(form.data.oldPassword, user.password)) {
			return message(form, 'Invalid credentials', { status: 401 })
		}

		// Update password
		await User.update({
			id: locals.user.id,
			password: await hashPassword(form.data.newPassword)
		})
	}
}