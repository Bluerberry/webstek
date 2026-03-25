
import { User, Session } from '$server/services'

import {
	validateToken,
	SESSION_INACTIVITY_TIMEOUT_MS,
	SESSION_VALIDATION_INTERVAL_MS
} from '$server/scripts/auth'

import type { Handle } from '@sveltejs/kit'

export const auth: Handle = async ({ event, resolve }) => {
	const now = new Date()
	const { cookies, locals } = event;

	// Get session cookie
	const sessionCookie = cookies.get('webstek_session')
	if (sessionCookie === undefined) {
		locals.user = undefined
		locals.session = undefined
		return await resolve(event)
	}

	// Get session
	const [ sessionId, sessionToken ] = sessionCookie.split(':')
	const session = await Session.getById(sessionId, true)
	if (session === undefined) {
		cookies.delete('webstek_session', { path: '/' })
		locals.user = undefined
		locals.session = undefined
		return await resolve(event)
	}

	// Validate timeout
	if (now.getTime() - session.lastValidatedAt.getTime() >= SESSION_INACTIVITY_TIMEOUT_MS) {
		cookies.delete('webstek_session', { path: '/' })
		locals.user = undefined
		locals.session = undefined
		await Session.delete(sessionId)
		return await resolve(event)
	}

	// Validate token
	if (!await validateToken(sessionToken, session.token)) {
		cookies.delete('webstek_session', { path: '/' })
		locals.user = undefined
		locals.session = undefined
		return await resolve(event)
	}

	// Success! Update lastValidatedAt
	if (now.getTime() - session.lastValidatedAt.getTime() >= SESSION_VALIDATION_INTERVAL_MS) {
		session.lastValidatedAt = now
		await Session.update(session)
	}

	locals.user = User.sanitize(session.user);
	locals.session = Session.sanitize(session);
	return await resolve(event)
}