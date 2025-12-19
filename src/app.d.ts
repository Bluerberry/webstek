
import type { SanitizedUser } from '$lib/types';

declare global {
	namespace App {
		interface Locals {
			user?: SanitizedUser
		}
	}
}

export {};
