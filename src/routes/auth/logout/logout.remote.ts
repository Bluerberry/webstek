
import { error } from '@sveltejs/kit'
import { command } from '$app/server'
import { Session } from '$server/services'
import { getRequestEvent } from '$app/server'
import { setToast } from '$server/scripts/toaster'
import { isLoggedIn } from '$server/scripts/permissions'

export const logout = command(async () => {
	const { locals, cookies } = getRequestEvent()

	// Validate userstate
	if (!isLoggedIn(locals)) {
		throw error(401, 'Unauthorized')
	}

	// Get session cookie
	const sessionCookie = cookies.get('webstek_session')
	if (sessionCookie === undefined) {
		throw error(403, 'No session cookie found')
	}

	// Logout
	const [sessionId] = sessionCookie.split(':')
	cookies.delete('webstek_session', { path: '/' })
	await Session.delete(sessionId)

	setToast(cookies, 'Successfully logged out')
})