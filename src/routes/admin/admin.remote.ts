
import z from 'zod'
import { error } from '@sveltejs/kit'
import { User } from '$server/services'
import { query, command, getRequestEvent } from '$app/server'
import { isAdmin } from '$server/scripts/permissions'

function formatCollateral(count: number, singular: string, plural?: string) {
	if (count === 0) return null
	const label = count > 1 ? (plural || `${singular}s`) : singular
	return `${count} ${label}`
}

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

export const getCollateralDamage = query(z.number(), async userId => {
	const { locals } = getRequestEvent()
	
	// Check permissions
	if (!isAdmin(locals)) {
		throw error(401, 'Unauthorized')
	}

	// Build result...
	const result: { title: string, collateral: string[] }[] = []
	
	/* Removed underworld cookbook from project.
	   I left this here for reference
	
	// Get data
	const [ recipes, notes ] = await Promise.all([
		Recipe.getByAuthorId(locals.user.id),
		RecipeNote.getByUserId(locals.user.id)
	])
	
	// Underworld Cookbook collateral
	const publicRecipes = recipes.filter(recipe => recipe.isPublic)

	const underworldCollateral = [
		formatCollateral(publicRecipes.length, 'Public recipe'),
		formatCollateral(recipes.length - publicRecipes.length, 'Private recipe'),
		formatCollateral(notes.length, 'Personal note')
	].filter(Boolean) as string[]
	
	if (underworldCollateral.length > 0) {
		result.push({
			title: 'Underworld Cookbook',
			collateral: underworldCollateral
		})
	}
	*/

	return result
})

export const promoteAccount = command(z.number(), async userId => {
	const { locals } = getRequestEvent()

	// Check permissions
	if (!isAdmin(locals)) {
		throw error(401, 'Unauthorized')
	}

	// Promote user
	await User.update({
		id: userId,
		role: 'admin'
	})
})

export const demoteAccount = command(z.number(), async userId => {
	const { locals } = getRequestEvent()

	// Check permissions
	if (!isAdmin(locals)) {
		throw error(401, 'Unauthorized')
	}

	// Demote user
	await User.update({
		id: userId,
		role: 'user'
	})
})

export const deleteAccount = command(z.number(), async userId => {
	const { locals } = getRequestEvent()

	// Check permissions
	if (!isAdmin(locals)) {
		throw error(401, 'Unauthorized')
	}

	// Delete user
	await User.delete(userId)
})