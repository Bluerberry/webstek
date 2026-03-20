
import { sequence } from '@sveltejs/kit/hooks'
import { auth, rateLimit } from '$server/hooks'

export const handle = sequence(rateLimit, auth)
