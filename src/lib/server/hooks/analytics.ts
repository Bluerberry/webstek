
import { Request } from '$server/services'
import type { Handle } from '@sveltejs/kit'

export const analytics: Handle = async ({ event, resolve }) => {
    const before = Date.now()
    const response = await resolve(event)
    const after = Date.now()

    if (
        event.request.method != 'GET'    &&
        event.request.method != 'POST'   &&
        event.request.method != 'PUT'    &&
        event.request.method != 'DELETE' &&
        event.request.method != 'PATCH'
    ) return response;

    Request.create(
        event.request.method,
        event.request.url,
        after - before
    )

    return response
}