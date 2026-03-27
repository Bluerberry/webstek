
import type { Cookies } from '@sveltejs/kit'

type Flash = {
	title: string
	body?: string
	duration?: 'default' | 'dismiss'
}

export function flashToast(cookies: Cookies, title: string, body?: string, duration: 'default' | 'dismiss' = 'default') {
	const existing = readFlash(cookies)
	const flash: Flash[] = [...existing, { title, body, duration }]

	cookies.set('webstek_flash', JSON.stringify(flash), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: true,
		maxAge: 60
	})
}

export function readFlash(cookies: Cookies): Flash[] {
	try {
		return JSON.parse(cookies.get('webstek_flash') ?? '[]')
	} catch {
		return []
	}
}