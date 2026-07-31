
import type { RequestEvent } from '@sveltejs/kit'
import type { ucbIngredientUnitType } from '$server/database'


// ─── Locals ─────────────────────────────────────────────────────────────

export type SanitizedUser = {
	id: number,
	email: string,
	verified: boolean,
	username: string,
	role: UserRole,
	collectMetadata: boolean
	createdAt: Date
}

export type SanitizedSession = {
	id: string,
	country?: string,
	browserName?: string,
	browserVersion?: string,
	lastValidatedAt: Date,
	createdAt: Date
}

export type SanitizedAppliedIngredient = {
	id: number
	name: string
	quantity: number
	density: number | null
	unitType: (typeof ucbIngredientUnitType.enumValues)[number]
	customUnit: string | null
}

export type SanitizedRecipe = {
	id: number
	title: string | null
	description: string | null
	duration: number | null
	portions: number | null
	tags: SanitizedTag[]
	utensils: SanitizedUtensil[]
	ingredients: SanitizedAppliedIngredient[]
	instructions: SanitizedInstruction[]
	parentId: number | null
	authorId: number | null
	createdAt: Date
}

export type SanitizedTag = {
	id: number
	name: string
}

export type SanitizedUtensil = {
	id: number
	name: string
}

export type SanitizedIngredient = {
	id: number
	name: string
	density: number | null
}

export type SanitizedInstruction = {
	index: number
	text: string
}

// ─── Permissions ─────────────────────────────────────────────────────────

export type UserRole = 'user' | 'admin'

export type StrangerLocals = App.Locals & {
	user: undefined, session: undefined
}

export type StrangerEvent = RequestEvent & { 
	locals: StrangerLocals
}

export type UserLocals = App.Locals & {
	user: NonNullable<App.Locals['user']>,
	session: NonNullable<App.Locals['session']>
}

export type UserEvent = RequestEvent & { 
	locals: UserLocals
}

export type AdminLocals = App.Locals & {
	user: NonNullable<App.Locals['user'] & { role: 'admin' }>,
	session: NonNullable<App.Locals['session']>
}

export type AdminEvent = RequestEvent & { 
	locals: AdminLocals
}

export type UnverifiedLocals = App.Locals & {
	user: NonNullable<App.Locals['user'] & { verified: false }>,
	session: NonNullable<App.Locals['session']>
}

export type UnverifiedUserEvent = RequestEvent & { 
	locals: UnverifiedLocals
}

export type VerifiedLocals = App.Locals & {
	user: NonNullable<App.Locals['user'] & { verified: true }>,
	session: NonNullable<App.Locals['session']>
}

export type VerifiedUserEvent = RequestEvent & { 
	locals: VerifiedLocals
}
