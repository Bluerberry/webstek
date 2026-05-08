
import { sequence } from '@sveltejs/kit/hooks'
import { analytics, auth, rateLimit, securityHeaders } from '$server/hooks'

// Always ratelimit first
// then set security headers
// then start response timer for analytics
// then check auth

export const handle = sequence(rateLimit, securityHeaders, analytics, auth)
