
import type { Cookies } from '@sveltejs/kit'

type Toast = {
	title: string
	body?: string
	duration?: 'default' | 'dismiss'
}

export function setToast(cookies: Cookies, title: string, body?: string, duration: 'default' | 'dismiss' = 'default') {
	cookies.set('flash', JSON.stringify({
		title, body, duration
	}), {
		path: '/',
		maxAge: 10,
		httpOnly: false
	})
}

export function getToast(cookies: Cookies): Toast | undefined {
	const toast = cookies.get('flash')
	if (!toast) return undefined
	
	cookies.delete('flash', { path: '/' })
	return JSON.parse(toast)
}