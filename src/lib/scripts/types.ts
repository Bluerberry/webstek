
export type UserRole = 'user' | 'admin'

export type SanitizedUser = {
	id: number,
	email: string,
	verified: boolean,
	username: string,
	role: UserRole,
	collectMetadata: boolean
}

export type SanitizedSession = {
	id: string,
	country?: string,
	browserName?: string,
	browserVersion?: string,
	lastValidatedAt: Date,
	createdAt: Date
}
