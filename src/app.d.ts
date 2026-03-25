
import type { SanitizedUser, SanitizedSession, Toast } from '$scripts/types'


declare global {
	namespace App {
		interface Locals {
			user?: SanitizedUser,
			session?: SanitizedSession,
			toasts: Toast[]
		}
	}
}

export {};
