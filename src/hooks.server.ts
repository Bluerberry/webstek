
import { sequence } from '@sveltejs/kit/hooks'
import { auth, rateLimit, securityHeaders } from '$server/hooks'

export const handle = sequence(rateLimit, auth, securityHeaders)
