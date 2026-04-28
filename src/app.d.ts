
import type { SanitizedUser, SanitizedSession } from '$scripts/types'

declare global {
	namespace App {
		interface Locals {
			user?: SanitizedUser,
			session?: SanitizedSession,
		}
	}
}

export {};
