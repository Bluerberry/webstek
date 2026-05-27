
import { redirect } from '@sveltejs/kit'
import { flashToast } from '$server/scripts/flash'
import { withFlow, createFlow, redirectToDestination } from '$scripts/flow'
import { isUser, isStranger, isVerified, isUnverified } from '$scripts/permissions'

import type { RequestEvent } from '@sveltejs/kit'
import type { 
	StrangerEvent, 
	UserEvent, 
	AdminEvent, 
	VerifiedUserEvent,
	UnverifiedUserEvent 
} from '$scripts/types'

// ─── Guards ───────────────────────────────────────────────────────────────

export function requireStranger(event: RequestEvent, fallback: string = '/'): asserts event is StrangerEvent {
	const { url, locals, cookies } = event
	if (isUser(locals)) {
		flashToast(cookies, 'Already logged in', 'You are already logged in')
		redirectToDestination(url, 303, fallback)
	}
}

export function requireUser(event: RequestEvent): asserts event is UserEvent {
	const { url, locals, cookies } = event
	if (isStranger(locals)) {
		flashToast(cookies, 'Login required', 'You must be logged in to access this page')
		redirect(303, withFlow('/auth/login', createFlow('login', url.pathname)))
	}
}

export function requireAdmin(event: RequestEvent, fallback: string = '/account'): asserts event is AdminEvent {
	const { url, locals, cookies } = event
	requireUser(event)

	if (isStranger(locals)) {
		flashToast(cookies, 'Insufficient permissions', 'You do not have the correct permissions to access this page')
		redirectToDestination(url, 303, fallback)
	}
}

export function requireUnverified(event: RequestEvent, fallback: string = '/account'): asserts event is UnverifiedUserEvent {
	const { url, locals, cookies } = event
	requireUser(event)

	if (isVerified(locals)) {
		flashToast(cookies, 'Already verified', 'You are already verified')
		redirect(303, redirectToDestination(url, 303, fallback))
	}
}

export function requireVerified(event: RequestEvent, fallback: string = '/account'): asserts event is VerifiedUserEvent {
	const { url, locals, cookies } = event
	requireUser(event)
	
	if (isUnverified(locals)) {
		flashToast(cookies, 'Verification required', 'Your account needs to be verified to access this page')
		redirect(303, redirectToDestination(url, 303, fallback))
	}
}