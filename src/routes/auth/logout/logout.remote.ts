
import { error } from '@sveltejs/kit'
import { command } from '$app/server'
import { Session } from '$server/services'
import { getRequestEvent } from '$app/server'
import { showToast } from '$server/scripts/toaster'
import { isUser } from '$server/scripts/permissions'

export const logout = command(async () => {
	const { locals, cookies } = getRequestEvent()

	// Check permissions
	if (!isUser(locals)) {
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

	showToast(locals, 'Successfully logged out')
})