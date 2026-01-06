
import { User, Session } from '$server/services'

import {
	validateToken,
	SESSION_INACTIVITY_TIMEOUT_MS,
	SESSION_VALIDATION_INTERVAL_MS
} from '$server/scripts/auth'

import type { Handle } from '@sveltejs/kit'

export const auth: Handle = async ({ event, resolve }) => {
	const now = new Date()

	// Get session cookie
	const sessionCookie = event.cookies.get('webstek_session')
	if (sessionCookie === undefined) {
		event.locals.user = undefined
		event.locals.session = undefined
		return await resolve(event)
	}

	// Get session
	const [ sessionId, sessionToken ] = sessionCookie.split(':')
	const session = await Session.getById(sessionId, true)
	if (session === undefined) {
		event.cookies.delete('webstek_session', { path: '/' })
		event.locals.user = undefined
		event.locals.session = undefined
		return await resolve(event)
	}

	// Validate timeout
	if (now.getTime() - session.lastValidatedAt.getTime() >= SESSION_INACTIVITY_TIMEOUT_MS) {
		event.cookies.delete('webstek_session', { path: '/' })
		event.locals.user = undefined
		event.locals.session = undefined
		await Session.delete(sessionId)
		return await resolve(event)
	}

	// Validate token
	if (!await validateToken(sessionToken, session.token)) {
		event.cookies.delete('webstek_session', { path: '/' })
		event.locals.user = undefined
		event.locals.session = undefined
		return await resolve(event)
	}

	// Success! Update lastValidatedAt
	if (now.getTime() - session.lastValidatedAt.getTime() >= SESSION_VALIDATION_INTERVAL_MS) {
		await Session.updateLastValidated(session.id, now)
	}

	event.locals.user = User.sanitize(session.user);
	event.locals.session = Session.sanitize(session);
	return await resolve(event)
}