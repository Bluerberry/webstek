
import { UAParser } from 'ua-parser-js'
import { env } from '$env/dynamic/private'
import { User, Session } from '$server/services'
import { flashToast } from '$server/scripts/flash'
import { zod4 } from 'sveltekit-superforms/adapters'
import { loginSchema } from '$validation/authSchemas'
import { redirectToDestination } from '$scripts/flow'
import { isStranger, requireStranger } from '$server/scripts/permissions'
import { superValidate, message } from 'sveltekit-superforms'
import { generateToken, hashToken, SESSION_INACTIVITY_TIMEOUT_MS, validatePassword } from '$server/scripts/auth'

import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async event => {

	// Check permissions
	requireStranger(event)

	return {
		loginForm: await superValidate(zod4(loginSchema))
	}
}

export const actions: Actions = {
	login: async ({ request, url, locals, cookies, fetch, getClientAddress }) => {

		// Validate form
		const form = await superValidate(request, zod4(loginSchema))
		if (!form.valid) return message(form, { type: 'error', text: 'Invalid form data' }, { status: 400 })

		// Check permissions
		if (!isStranger(locals)) {
			return message(form, { type: 'error', text: 'Already logged in' }, { status: 403 })
		}

		// Get user
		const user = await User.getByEmail(form.data.email)
		if (user === undefined) {
			await validatePassword(form.data.password, 'salt:hash') // Validate bogus password to fight timing attacks
			return message(form, { type: 'error', text: 'Invalid credentials' }, { status: 401 })
		}

		// Validate password
		if (!await validatePassword(form.data.password, user.password)) {
			return message(form, { type: 'error', text: 'Invalid credentials' }, { status: 401 })
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
		flashToast(cookies, 'Successfully logged in')
		redirectToDestination(url, 303, '/')
	}
}