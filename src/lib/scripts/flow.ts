
import { goto } from '$app/navigation'
import { redirect } from '@sveltejs/kit'

export type FlowIntent = 'login'
					   | 'logout'
					   | 'register'
					   | 'verify'
					   | 'reset'

export type Flow = {
	intent?: FlowIntent
	destination?: string
}

// ─── Reading ────────────────────────────────────────────────────────────────

export function getFlow(url: URL): Flow {
	return {
		intent: (url.searchParams.get('intent') ?? undefined) as FlowIntent | undefined,
		destination: url.searchParams.get('dest') ?? undefined
	}
}

// ─── Building ───────────────────────────────────────────────────────────────

export function createFlow(intent?: FlowIntent, destination?: string): URLSearchParams {
	const params = new URLSearchParams()
	if (intent !== undefined) params.set('intent', intent)
	if (destination !== undefined) params.set('dest', destination)
	return params
}

export function withFlow(path: string, flow: Flow | URLSearchParams): string {
	const params = flow instanceof URLSearchParams ? flow : createFlow(flow.intent, flow.destination)
	if (params.size === 0) return path
	const separator = path.includes('?') ? '&' : '?'
	return `${path}${separator}${params}`
}

export function flowAction(url: URL, actionName: string): string {
	const { intent, destination } = getFlow(url)
	const params = createFlow(intent, destination)
	if (params.size === 0) return `?/${actionName}`
	return `?/${actionName}&${params}`
}

// ─── Redirecting ─────────────────────────────────────────────────────────────

export function redirectWithFlow(url: URL, status: Parameters<typeof redirect>[0], path: string): never {
	const { intent, destination } = getFlow(url)
	redirect(status, withFlow(path, { intent, destination }))
}

export function redirectToDestination(url: URL, status: Parameters<typeof redirect>[0], fallback: string): never {
	redirect(status, getFlow(url).destination ?? fallback)
}

export function gotoWithFlow(url: URL, path: string) {
	const { intent, destination } = getFlow(url)
	goto(withFlow(path, { intent, destination }))
}

export function gotoDestination(url: URL, fallback: string) {
	goto(getFlow(url).destination ?? fallback)
}

// ─── Auth guard ──────────────────────────────────────────────────────────────

export function requireAuth(url: URL, locals: App.Locals): asserts locals is App.Locals & { user: NonNullable<App.Locals['user']>, session: NonNullable<App.Locals['session']> } {
	if (locals.user === undefined) {
		redirect(303, withFlow('/auth/login', createFlow('login', url.pathname)))
	}
}