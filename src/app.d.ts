
import type { Flow, SanitizedUser, SanitizedSession } from '$lib/types'

declare global {
	namespace App {
		interface Locals {
			flow?: Flow,
			user?: SanitizedUser,
			session?: SanitizedSession
		}
	}
}

export {};
