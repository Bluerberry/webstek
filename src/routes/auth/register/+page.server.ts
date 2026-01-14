
import { redirect } from '@sveltejs/kit'
import { zod4 } from 'sveltekit-superforms/adapters'
import { registerSchema } from '$validation/authSchemas'
import { superValidate, message } from 'sveltekit-superforms'
import { generateToken, hashPassword, hashToken, SESSION_INACTIVITY_TIMEOUT_MS } from '$server/scripts/auth'
import { User, Session } from '$server/services'
import { UAParser } from 'ua-parser-js'
import { env } from '$env/dynamic/private'

import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ locals }) => {

	// Validate userstate
	if (locals.user !== undefined) {
		redirect(303, '/')
	}

	return {
		registerForm: await superValidate(zod4(registerSchema))
	}
}

export const actions: Actions = {
	default: async ({ request, locals, cookies, getClientAddress, fetch }) => {

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

		// Session metadata
		let ipInfo: any = undefined
		let userAgent: UAParser.IResult | undefined = undefined

		if (user.collectMetadata) {
			const ip = request.headers.get('x-forwarded-for') || getClientAddress()
			const response = await fetch(`https://api.ipinfo.io/lite/${ip}?token=${env.IPINFO_TOKEN}`)
			ipInfo = await response.json()

			const rawUserAgent = request.headers.get('user-agent') ?? '';
			const parser = new UAParser(rawUserAgent);
			userAgent = parser.getResult();
		}

		// Login
		const sessionId = generateToken()
		const sessionToken = generateToken()

		await Session.create(
			sessionId, 
			await hashToken(sessionToken),
			user.id,
			ipInfo?.country,
			userAgent?.browser.name,
			userAgent?.browser.version
		)

		cookies.set('webstek_session', `${sessionId}:${sessionToken}`, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: true,
			maxAge: SESSION_INACTIVITY_TIMEOUT_MS / 1000
		})

		// Redirect to verification
		redirect(303, '/auth/verify')
	}
}