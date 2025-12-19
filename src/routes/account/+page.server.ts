import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {

	// Validate userstate
	if (locals.user === undefined) {
		redirect(401, '/')
	}
}