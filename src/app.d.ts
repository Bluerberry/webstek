
import type { SanitizedUser, SanitizedSession } from '$lib/types';

declare global {
	namespace App {
		interface Locals {
			user?: SanitizedUser,
			session?: SanitizedSession
		}
	}
}

export {};
