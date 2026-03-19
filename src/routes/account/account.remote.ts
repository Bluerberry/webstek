
import z from 'zod'
import { query, command, getRequestEvent } from '$app/server'
import { Session, User, Recipe, RecipeNote } from '$server/services'
import { error } from '@sveltejs/kit';

function formatCollateral(count: number, singular: string, plural?: string) {
	if (count === 0) return null
	const label = count > 1 ? (plural || `${singular}s`) : singular
	return `${count} ${label}`
}

export const getSessions = query(async () => {
	const { locals } = getRequestEvent()
	
	// Check if logged in
	if (locals.user === undefined) {
		throw error(401, 'Unauthorized')
	}

	// Get data
	const sessions = await Session.getByUserId(locals.user.id)
	return sessions.map(Session.sanitize)
})

export const getCollateralDamage = query(async () => {
	const { locals } = getRequestEvent()
	
	// Check if logged in
	if (locals.user === undefined) {
		throw error(401, 'Unauthorized')
	}
	
	// Get data
	const [ recipes, notes ] = await Promise.all([
		Recipe.getByAuthorId(locals.user.id),
		RecipeNote.getByUserId(locals.user.id)
	])
	
	// Build result...
	const result: { title: string, collateral: string[] }[] = []
	
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

	return result
})

export const setCollectMetadata = command(z.boolean(), async value => {
	const { locals } = getRequestEvent()
	
	// Check if logged in
	if (locals.user === undefined) {
		throw error(401, 'Unauthorized')
	}

	// Set collect metadata
	await User.setCollectMetadata(locals.user.id, value);
})

export const endSession = command(z.string(), async sessionId => {
	const { locals } = getRequestEvent()

	// Check if logged in
	if (locals.user === undefined) {
		throw error(401, 'Unauthorized')
	}
	
	// Check if session exists
	const session = await Session.getById(sessionId);
	if (session === undefined) return;

	// Check if session belongs to user
	if (locals.user.id !== session.userId) {
		throw error(403, 'Forbidden')
	}

	// Delete session
	await Session.delete(sessionId)
})

export const deleteAccount = command(async () => {
	const { locals, cookies } = getRequestEvent()

	// Check if logged in
	if (locals.user === undefined) {
		throw error(401, 'Unauthorized')
	}

	// Delete user
	await User.delete(locals.user.id)
	cookies.delete('webstek_session', { path: '/' })
})