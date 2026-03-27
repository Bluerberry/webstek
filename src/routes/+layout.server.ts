
import { readFlash } from '$server/scripts/flash'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
    const flash = readFlash(cookies)
    if (flash.length) cookies.delete('webstek_flash', { path: '/' })

    return {
        user: locals.user,
        session: locals.session,
        flash
    }
}