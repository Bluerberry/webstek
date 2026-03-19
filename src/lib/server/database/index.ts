
import postgres from 'postgres'
import * as schema from './schema'
import { env } from '$env/dynamic/private'
import { drizzle } from 'drizzle-orm/postgres-js'

const client = postgres(env.DATABASE_URL)

export * from './schema'
export const db = drizzle(client, { schema })