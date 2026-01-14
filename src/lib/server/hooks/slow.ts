
import type { Handle } from '@sveltejs/kit'

export const slow: Handle = async ({ event, resolve }) => {
	await new Promise(resolve => setTimeout(resolve, 3000))
	return await resolve(event)
}