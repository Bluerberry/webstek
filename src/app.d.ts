declare global {
	namespace App {
		interface Locals {
			flow?: {
				id: number,
				redirect: string
			},
			user?: {
				id: number,
				email: string,
				verified: boolean,
				username: string
			}
		}
	}
}

export {};
