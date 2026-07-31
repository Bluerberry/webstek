
import { UcbRecipeService } from '$server/services'
import { error } from '@sveltejs/kit'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async event => {
    const recipe = await UcbRecipeService.getById(
        parseInt(event.params.id)
    )

    if (recipe === undefined) {
        error(404, 'Not found')
    }

    return {
        recipe: UcbRecipeService.sanitize(recipe)
    }
}