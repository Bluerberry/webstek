
import { error } from '@sveltejs/kit'
import { command } from '$app/server'
import { SessionService } from '$server/services'
import { isUser } from '$scripts/permissions'
import { getRequestEvent } from '$app/server'
import { flashToast } from '$server/scripts/flash'

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
	await SessionService.delete(sessionId)

	flashToast(cookies, 'Successfully logged out')
})