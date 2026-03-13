
export type FlowIntent = 'login'
					   | 'logout'
					   | 'register'
					   | 'update'

export type Flow = {
	intent?: FlowIntent
	destination?: string
}

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
