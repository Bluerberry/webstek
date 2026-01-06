
import z from 'zod'
import { query, command } from '$app/server'
import { Session } from '$server/services'

export const getSessions = query(z.number(), async userId => {
	const sessions = await Session.getByUserId(userId)
	return sessions.map(Session.sanitize)
})

export const endSession = command(z.string(), async (sessionId: string) => {
	await Session.delete(sessionId)
})