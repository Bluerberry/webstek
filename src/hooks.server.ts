
import { sequence } from '@sveltejs/kit/hooks'
import { auth } from '$server/hooks'

export const handle = sequence(auth)
