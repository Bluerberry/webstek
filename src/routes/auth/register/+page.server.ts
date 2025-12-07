
import { redirect } from '@sveltejs/kit'
import { zod4 } from 'sveltekit-superforms/adapters'
import { registerSchema } from '$lib/schemas/authSchemas'
import { superValidate, message } from 'sveltekit-superforms'
import { generateToken, hashPassword, hashToken } from '$lib/server/scripts/auth'
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
		registerForm: await superValidate(zod4(registerSchema))
	}
}

export const actions: Actions = {
	default: async ({ request, locals, cookies }) => {

		// Validate form
		const form = await superValidate(request, zod4(registerSchema))
		if (!form.valid) return message(form, 'Invalid form data', { status: 400 })

		// Validate userstate
		if (locals.user !== undefined) {
			return message(form, 'Already logged in', { status: 403 })
		}

		// Check for duplicate emails
		if (await User.getByEmail(form.data.email)) {
			return message(form, 'Email already exists', { status: 400 })
		}

		// Register	
		const user = await User.create(
			form.data.email, 
			form.data.username, 
			await hashPassword(form.data.password)
		)

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

		// Redirect to verification
		const flow = await Flow.create('/dashboard')
		redirect(303, `/auth/verify?flow=${flow.id}`)
	}
}