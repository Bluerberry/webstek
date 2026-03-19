
import * as crypto from 'crypto'

export const SESSION_INACTIVITY_TIMEOUT_MS = 1000 * 60 * 60 * 24 * 14	// 14 days
export const SESSION_VALIDATION_INTERVAL_MS = 1000 * 60 * 60			// 1 hour
export const EMAIL_VERIFICATION_TIMEOUT_MS = 1000 * 60 * 15				// 15 minutes
export const EMAIL_VERIFICATION_COOLDOWN_MS = 1000 * 60					// 1 minute
export const PASSWORD_RESET_TIMEOUT_MS = 1000 * 60 * 15				// 15 minutes
export const PASSWORD_RESET_COOLDOWN_MS = 1000 * 60					// 1 minute

export function generateToken() {
	return crypto
		.randomBytes(32)
		.toString('hex')
}

export function generateCode() {
	return String(
		crypto.randomInt(0, 1000000)
	).padStart(6, '0')
}

export async function hashToken(token: string) {
	return crypto
		.createHash('sha256')
		.update(token)
		.digest('hex')
}

export async function validateToken(token: string, reference: string) {
	const hash = await hashToken(token)
	const a = Buffer.from(hash)
	const b = Buffer.from(reference)
	return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export async function hashPassword(password: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const salt = crypto.randomBytes(16).toString('hex')
		crypto.scrypt(password, salt, 64, (error, hash) => {
			if (error) reject(error)
			resolve(`${salt}:${hash.toString('hex')}`)
		})
	})
}

export function validatePassword(password: string, reference: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
		const [salt, hash] = reference.split(':')
		const a = Buffer.from(hash, 'hex')

		crypto.scrypt(password, salt, 64, (error, b) => {
			if (error) reject(error)
			resolve(a.length === b.length && crypto.timingSafeEqual(a, b))
		})
	})
}
