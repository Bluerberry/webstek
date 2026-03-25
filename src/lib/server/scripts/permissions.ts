
import { redirect } from '@sveltejs/kit'
import { showToast } from '$server/scripts/toaster'
import { withFlow, createFlow, redirectToDestination } from '$scripts/flow'

import type { RequestEvent } from '@sveltejs/kit'
import type { 
	StrangerLocals, 
	StrangerEvent, 
	UserLocals, 
	UserEvent, 
	AdminLocals, 
	AdminEvent, 
	VerifiedLocals, 
	VerifiedUserEvent,
	UnverifiedLocals, 
	UnverifiedUserEvent 
} from '$scripts/types'


// ─── Checks ───────────────────────────────────────────────────────────────

export function isStranger(locals: App.Locals) : locals is StrangerLocals {
	return locals.user === undefined
}

export function isUser(locals: App.Locals): locals is UserLocals {
	return locals.user !== undefined
}

export function isAdmin(locals: App.Locals): locals is AdminLocals {
	return isUser(locals) && locals.user.role === 'admin'
}

export function isVerified(locals: App.Locals): locals is VerifiedLocals {
	return isUser(locals) && locals.user.verified
}

export function isUnverified(locals: App.Locals): locals is UnverifiedLocals {
	return isUser(locals) && !locals.user.verified
}

// ─── Guards ───────────────────────────────────────────────────────────────

export function requireStranger(event: RequestEvent, fallback: string = '/'): asserts event is StrangerEvent {
	const { url, locals } = event
	if (isUser(locals)) {
		showToast(locals, 'Already logged in', 'You are already logged in')
		redirectToDestination(url, 303, fallback)
	}
}

export function requireUser(event: RequestEvent): asserts event is UserEvent {
	const { url, locals } = event
	if (isStranger(locals)) {
		showToast(locals, 'Login required', 'You must be logged in to access this page')
		redirect(303, withFlow('/auth/login', createFlow('login', url.pathname)))
	}
}

export function requireAdmin(event: RequestEvent, fallback: string = '/account'): asserts event is AdminEvent {
	const { url, locals } = event
	requireUser(event)

	if (isStranger(locals)) {
		showToast(locals, 'Insufficient permissions', 'You do not have the correct permissions to access this page')
		redirectToDestination(url, 303, fallback)
	}
}

export function requireUnverified(event: RequestEvent, fallback: string = '/account'): asserts event is UnverifiedUserEvent {
	const { url, locals } = event
	requireUser(event)

	if (isVerified(locals)) {
		showToast(locals, 'Already verified', 'You are already verified')
		redirect(303, redirectToDestination(url, 303, fallback))
	}
}

export function requireVerified(event: RequestEvent, fallback: string = '/account'): asserts event is VerifiedUserEvent {
	const { url, locals } = event
	requireUser(event)
	
	if (isUnverified(locals)) {
		showToast(locals, 'Verification required', 'Your account needs to be verified to access this page')
		redirect(303, redirectToDestination(url, 303, fallback))
	}
}