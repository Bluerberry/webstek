
import type { Flow, SanitizedUser, SanitizedSession } from '$scripts/types'

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
