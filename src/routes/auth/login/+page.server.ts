
import { redirect } from '@sveltejs/kit'
import { zod4 } from 'sveltekit-superforms/adapters'
import { loginSchema } from '$validation/authSchemas'
import { superValidate, message } from 'sveltekit-superforms'
import { generateToken, hashToken, validatePassword } from '$server/scripts/auth'
import { User, Session } from '$server/services'

import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ locals }) => {

	// Validate userstate
	if (locals.user !== undefined) {
		redirect(403, '/')
	}

	return {
		loginForm: await superValidate(zod4(loginSchema))
	}
}

export const actions: Actions = {
	default: async ({ request, locals, cookies }) => {

		// Validate form
		const form = await superValidate(request, zod4(loginSchema))
		if (!form.valid) return message(form, 'Invalid form data', { status: 400 })

		// Validate userstate
		if (locals.user !== undefined) {
			return message(form, 'Already logged in', { status: 403 })
		}

		// Get user
		const user = await User.getByEmail(form.data.email)
		if (user === undefined) {
			return message(form, 'Invalid credentials', { status: 401 })
		}

		// Validate password
		if (!await validatePassword(form.data.password, user.password)) {
			return message(form, 'Invalid credentials', { status: 401 })
		}

		// Login
		const sessionId = generateToken()
		const sessionToken = generateToken()

		await Session.create(
			sessionId, 
			await hashToken(sessionToken),
			user.id
		)

		cookies.set('webstek_session', `${sessionId}:${sessionToken}`, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: true
		})

		// Redirect
		redirect(303, '/')
	}
}