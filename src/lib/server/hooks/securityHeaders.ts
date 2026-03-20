
import type { Handle } from '@sveltejs/kit'

export const securityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event)

	response.headers.set('X-Frame-Options', 'SAMEORIGIN')
	response.headers.set('X-Content-Type-Options', 'nosniff')
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

	return response
}