
/** Database seeding script
 * 	run using `set DATABASE_URL=value && npx tsx seed.ts`
 */

import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { users, sessions, emailVerifications, passwordResets } from './src/lib/server/database/schema/auth'
import * as crypto from 'crypto'

// ── Config ──────────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) throw new Error('DATABASE_URL is not set')

const client = postgres(DATABASE_URL)
const db = drizzle(client)

// ── Helpers ─────────────────────────────────────────────────────────────────

async function hashPassword(password: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const salt = crypto.randomBytes(16).toString('hex')
		crypto.scrypt(password, salt, 64, (error, hash) => {
			if (error) reject(error)
			resolve(`${salt}:${hash.toString('hex')}`)
		})
	})
}

const FIRST_NAMES = [
	'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
	'Iris', 'Jack', 'Karen', 'Liam', 'Mia', 'Noah', 'Olivia', 'Peter',
	'Quinn', 'Rachel', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xander',
	'Yasmine', 'Zoe'
]

const LAST_NAMES = [
	'Smith', 'Jones', 'Williams', 'Brown', 'Taylor', 'Davies', 'Evans',
	'Wilson', 'Thomas', 'Roberts', 'Johnson', 'Lewis', 'Walker', 'Robinson',
	'Wood', 'Thompson', 'White', 'Watson', 'Jackson', 'Wright', 'Green',
	'Harris', 'Cooper', 'King', 'Lee'
]

function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)]
}

function generateUsername(first: string, last: string, index: number): string {
	const styles = [
		() => `${first.toLowerCase()}${last.toLowerCase()}`,
		() => `${first.toLowerCase()}_${last.toLowerCase()}`,
		() => `${first.toLowerCase()}${index}`,
		() => `${first.toLowerCase()[0]}${last.toLowerCase()}`,
		() => `${first.toLowerCase()}${last.toLowerCase()[0]}${index}`,
	]
	return styles[index % styles.length]()
}

// ── Seed ─────────────────────────────────────────────────────────────────────

const USER_COUNT  = 50
const DEFAULT_PASSWORD = 'password123'

async function seed() {
	console.log('🌱 Seeding database...\n')

	// Clear existing seed data
	console.log('🗑  Clearing existing users...')
	await db.delete(passwordResets)
	await db.delete(emailVerifications)
	await db.delete(sessions)
	await db.delete(users)

	// Hash the shared password once
	const hashedPassword = await hashPassword(DEFAULT_PASSWORD)

	const rows: (typeof users.$inferInsert)[] = []

	for (let i = 0; i < USER_COUNT; i++) {
		const first = pick(FIRST_NAMES)
		const last  = pick(LAST_NAMES)
		const username = generateUsername(first, last, i)
		const email = `${username}@example.com`

		rows.push({
			email,
			username,
			password: hashedPassword,
			verified: Math.random() > 0.3,           // ~70% verified
			role: i === 0 ? 'admin' : 'user',        // first user is admin
			collectMetadata: Math.random() > 0.2,    // ~80% opt in
		})
	}

	console.log(`👤 Inserting ${USER_COUNT} users...`)
	const inserted = await db.insert(users).values(rows).returning()

	// Summary
	const admins   = inserted.filter(u => u.role === 'admin').length
	const verified = inserted.filter(u => u.verified).length

	console.log('\n✅ Done!\n')
	console.log(`   Total users : ${inserted.length}`)
	console.log(`   Admins      : ${admins}`)
	console.log(`   Verified    : ${verified}`)
	console.log(`   Password    : "${DEFAULT_PASSWORD}" (all users)\n`)
	console.log(`   Admin login : ${inserted[0].email}`)

	await client.end()
}

seed().catch(err => {
	console.error('❌ Seed failed:', err)
	process.exit(1)
})