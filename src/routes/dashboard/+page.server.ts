
import { redirect } from '@sveltejs/kit'
import { Flow } from '$lib/server/services'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {

    // Validate userstate
    if (locals.user === undefined) {
        const flow = await Flow.create('/dashboard')
        redirect(401, `/auth/login?flow=${flow.id}`)
    }
}