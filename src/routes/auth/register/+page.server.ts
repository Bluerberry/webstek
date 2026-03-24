
import { UAParser } from 'ua-parser-js'
import { env } from '$env/dynamic/private'
import { User, Session } from '$server/services'
import { redirectWithFlow } from '$scripts/flow'
import { zod4 } from 'sveltekit-superforms/adapters'
import { registerSchema } from '$validation/authSchemas'
import { isLoggedIn, requireStranger } from '$server/scripts/permissions'
import { superValidate, message } from 'sveltekit-superforms'
import { generateToken, hashPassword, hashToken, SESSION_INACTIVITY_TIMEOUT_MS } from '$server/scripts/auth'

import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async event => {
	requireStranger(event)

	return {
		registerForm: await superValidate(zod4(registerSchema))
	}
}

export const actions: Actions = {
	register: async ({ request, url, locals, cookies, getClientAddress, fetch }) => {

		// Validate form
		const form = await superValidate(request, zod4(registerSchema))
		if (!form.valid) return message(form, { type: 'error', text: 'Invalid form data' }, { status: 400 })

		// Validate userstate
		if (isLoggedIn(locals)) {
			return message(form, { type: 'error', text: 'Already logged in' }, { status: 403 })
		}

		// Register
		try {
			var user = await User.create(
				form.data.email,
				form.data.username,
				await hashPassword(form.data.password)
			)
		} catch (error: any) {
			if (error.code === '23505') { // Postgres unique violation
				return message(form, { type: 'error', text: 'Email already exists' }, { status: 400 })
			}

			throw error
		}

		// Session metadata
		let ipInfo: any = undefined
		let userAgent: UAParser.IResult | undefined = undefined

		if (user.collectMetadata) {
			const ip = getClientAddress()
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

		// Redirect
		redirectWithFlow(url, 303, '/auth/verify')
	}
}