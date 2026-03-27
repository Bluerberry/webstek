
import { error } from '@sveltejs/kit'
import { User } from '$server/services'
import { query, getRequestEvent } from '$app/server'
import { isAdmin } from '$server/scripts/permissions'

export const getUsers = query(async () => {
	const { locals } = getRequestEvent()

	// Check permissions
	if (!isAdmin(locals)) {
		throw error(401, 'Unauthorized')
	}

	// Get data
	const users = await User.getAll()
	return users.map(User.sanitize)
})
