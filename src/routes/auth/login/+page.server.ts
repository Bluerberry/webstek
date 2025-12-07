
import { redirect } from '@sveltejs/kit'
import { zod4 } from 'sveltekit-superforms/adapters'
import { loginSchema } from '$lib/schemas/authSchemas'
import { superValidate, message } from 'sveltekit-superforms'
import { generateToken, hashPassword, hashToken, validatePassword } from '$lib/server/scripts/auth'
import { User, Session, Flow } from '$lib/server/services'

import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ locals, url }) => {

	// Validate userstate
	if (locals.user !== undefined) {
		if (locals.flow === undefined) redirect(403, '/')
		await Flow.delete(locals.flow.id)
		redirect(403, locals.flow.redirect)
	}

	return {
		loginForm: await superValidate(zod4(loginSchema))
	}
}

export const actions: Actions = {
	default: async ({ request, locals, cookies, url }) => {

		// Validate form
		const form = await superValidate(request, zod4(loginSchema))
		if (!form.valid) return message(form, 'Invalid form data', { status: 400 })

		// Validate userstate
		if (locals.user !== undefined) {
			return message(form, 'Already logged in', { status: 403 })
		}

		// Get user
		const user = await User.getByEmail(form.data.email)
		if (user === undefined) return message(form, 'Invalid credentials', { status: 401 })

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

		// Redirect appropriately
		if (locals.flow === undefined) redirect(303, '/')
		await Flow.delete(locals.flow.id)
		redirect(303, locals.flow.redirect)
	}
}