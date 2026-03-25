
import { error } from '@sveltejs/kit'
import type { Handle } from '@sveltejs/kit'

type RateLimitRule = {
	limit: number
	windowMs: number
	blockMs: number
}

type RequestRecord = {
	timestamps: number[]
	blockedUntil?: number
}

const RULES: [string, RateLimitRule][] = [
	['/auth', { limit: 15, windowMs: 1000 * 60 * 5, blockMs: 1000 * 60 * 10 }],		// 15 rqst per 5 min - blocks 10 min
	['/account', { limit: 30, windowMs: 1000 * 60 * 5, blockMs: 1000 * 60 * 5 }],	// 30 rqst per 5 min - blocks 5 min
	['/', { limit: 200, windowMs: 1000 * 60 * 15, blockMs: 1000 * 60 * 5 }]			// 200 rqst per 15 min - blocks 5 min
]

/* We currently use an in-memory store. This is only okay for
 * single-server deployment. If at any point we scale horizontally,
 * this will silently break, and will require a Redis-backed store
 * or similar.
 */

const store = new Map<string, Map<string, RequestRecord>>()

function getRule(pathname: string): [string, RateLimitRule] | undefined {
	return RULES.find(([ prefix ]) => pathname.startsWith(prefix))
}

function getRecord(ip: string, prefix: string): RequestRecord {
	if (!store.has(ip)) store.set(ip, new Map())
	const routes = store.get(ip)!
	if (!routes.has(prefix)) routes.set(prefix, { timestamps: [] })
	return routes.get(prefix)!
}

// Prune every 5 min
setInterval(() => {
	const now = Date.now()
	for (const [ ip, routes ] of store) {
		for (const [ prefix, record ] of routes) {
			const rule = RULES.find(rule => rule[0] === prefix)?.[1]
			if (!rule) { 
				routes.delete(prefix)
				continue
			}

			// Prune timestamps older than the time window
			record.timestamps = record.timestamps.filter(time => now - time < rule.windowMs)

			// Prune unblocked records without timestamps
			if (record.timestamps.length === 0 && (record.blockedUntil ?? 0) < now) {
				routes.delete(prefix)
			}
		}

		// Prune ips without any records across all routes
		if (routes.size === 0) store.delete(ip)
	}
}, 1000 * 60 * 5)

export const rateLimit: Handle = async ({ event, resolve }) => {
	const { request, url, getClientAddress } = event
	if (request.method === 'GET') return resolve(event)

	const now = Date.now()

	// Get rule
	const match = getRule(url.pathname)
	if (!match) return resolve(event)
	const [ prefix, rule ] = match

	// Get record
	const ip = getClientAddress()
	const record = getRecord(ip, prefix)

	// Check active block
	if (record.blockedUntil && now < record.blockedUntil) {
		const retryAfter = Math.ceil((record.blockedUntil - now) / 1000)
		throw error(429, { message: 'Too many requests', retryAfter } as any)
	}

	// Evict timestamps outside the window
	record.timestamps = record.timestamps.filter(t => now - t < rule.windowMs)
	record.timestamps.push(now)

	// Breach — apply block
	if (record.timestamps.length > rule.limit) {
		record.blockedUntil = now + rule.blockMs
		record.timestamps = []

		const retryAfter = Math.ceil(rule.blockMs / 1000)
		throw error(429, { message: 'Too many requests', retryAfter } as any)
	}

	const response = await resolve(event)

	// Expose standard headers
	response.headers.set('X-RateLimit-Limit', String(rule.limit))
	response.headers.set('X-RateLimit-Remaining', String(rule.limit - record.timestamps.length))
	response.headers.set('X-RateLimit-Reset', String(Math.ceil((now + rule.windowMs) / 1000)))
	
	return response
}