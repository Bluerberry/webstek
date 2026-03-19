
export type SanitizedUser = {
	id: number,
	email: string,
	verified: boolean,
	username: string,
	collectMetadata: boolean
}

export type SanitizedSession = {
	id: string,
	country?: string,
	browserName?: string,
	browserVersion?: string,
	lastVerifiedAt: Date,
	createdAt: Date
}
