
import { redirect } from '@sveltejs/kit'
import { setToast } from '$server/scripts/toaster'
import { withFlow, createFlow, redirectToDestination } from '$scripts/flow'

import type { RequestEvent } from '@sveltejs/kit'

type StrangerEvent = RequestEvent & { 
	locals: App.Locals & {
		user: undefined, session: undefined
	}
}

type UserLocals = App.Locals & {
	user: NonNullable<App.Locals['user']>,
	session: NonNullable<App.Locals['session']>
}

type UserEvent = RequestEvent & { 
	locals: UserLocals
}

type AdminLocals = App.Locals & {
	user: NonNullable<App.Locals['user'] & { role: 'admin' }>,
	session: NonNullable<App.Locals['session']>
}

type AdminEvent = RequestEvent & { 
	locals: AdminLocals
}

type UnverifiedUserEvent = RequestEvent & { 
	locals: App.Locals & {
		user: NonNullable<App.Locals['user'] & { verified: false }>,
		session: NonNullable<App.Locals['session']>
	}
}

type VerifiedLocals = App.Locals & {
	user: NonNullable<App.Locals['user'] & { verified: true }>,
	session: NonNullable<App.Locals['session']>
}

type VerifiedUserEvent = RequestEvent & { 
	locals: VerifiedLocals
}

// ─── Checks ───────────────────────────────────────────────────────────────

export function isLoggedIn(locals: App.Locals): locals is UserLocals {
	return locals.user !== undefined
}

export function isVerified(locals: App.Locals): locals is VerifiedLocals {
	return isLoggedIn(locals) && locals.user.verified
}

function isAdmin(locals: App.Locals): locals is AdminLocals {
	return isLoggedIn(locals) && locals.user.role === 'admin'
}

// ─── Guards ───────────────────────────────────────────────────────────────

export function requireStranger(event: RequestEvent, fallback: string = '/'): asserts event is StrangerEvent {
	if (isLoggedIn(event.locals)) {
		setToast(event.cookies, 'Already logged in', 'You are already logged in')
		redirectToDestination(event.url, 303, fallback)
	}
}

export function requireUser(event: RequestEvent): asserts event is UserEvent {
	if (!isLoggedIn(event.locals)) {
		setToast(event.cookies, 'Login required', 'You must be logged in to access this page')
		redirect(303, withFlow('/auth/login', createFlow('login', event.url.pathname)))
	}
}

export function requireAdmin(event: RequestEvent, fallback: string = '/account'): asserts event is AdminEvent {
	requireUser(event)
	if (!isAdmin(event.locals)) {
		setToast(event.cookies, 'Insufficient permissions', 'You do not have the correct permissions to access this page')
		redirectToDestination(event.url, 303, fallback)
	}
}

export function requireUnverified(event: RequestEvent, fallback: string = '/account'): asserts event is UnverifiedUserEvent {
	requireUser(event)
	if (isVerified(event.locals)) {
		setToast(event.cookies, 'Already verified', 'You are already verified')
		redirect(303, redirectToDestination(event.url, 303, fallback))
	}
}

export function requireVerified(event: RequestEvent, fallback: string = '/account'): asserts event is VerifiedUserEvent {
	requireUser(event)
	if (!isVerified(event.locals)) {
		setToast(event.cookies, 'Verification required', 'Your account needs to be verified to access this page')
		redirect(303, redirectToDestination(event.url, 303, fallback))
	}
}