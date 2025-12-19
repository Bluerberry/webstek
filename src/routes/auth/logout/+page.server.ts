
import { fail } from '@sveltejs/kit'
import { Session } from '$server/services'

import type { Actions } from './$types'

export const actions: Actions = {
	default: async ({ locals, cookies }) => {

		// Validate userstate
		if (locals.user === undefined) {
			return fail(403, { message: 'You are not logged in' })
		}

		// Get session cookie
		const sessionCookie = cookies.get('webstek_session')
		if (sessionCookie === undefined) {
			locals.user = undefined
			return fail(403, { message: 'ACHIEVEMENT UNLOCKED - you were logged in without a valid session!' })
		}

		// Logout
		cookies.delete('webstek_session', { path: '/' })
		const [ sessionId ] = sessionCookie.split(':')
		await Session.delete(sessionId)
	}
}