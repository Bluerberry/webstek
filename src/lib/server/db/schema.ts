
import { relations } from 'drizzle-orm'
import { pgTable, serial, varchar, integer, timestamp, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	email: varchar('email', { length: 255 }).unique().notNull(),
	verified: boolean('verified').default(false).notNull(),
	verificationId: integer('verification_id'),
	username: varchar('username', { length: 255 }).notNull(),
	password: varchar('password', { length: 255 }).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
})

export const userRelations = relations(users, ({ one, many }) => ({
	sessions: many(sessions),
	verification: one(verifications, {
		fields: [users.verificationId],
		references: [verifications.id]
	})
}))

export const sessions = pgTable('sessions', {
	id: varchar('id', { length: 64 }).primaryKey(),
	token: varchar('token', { length: 64 }).notNull(),
	userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
	lastValidatedAt: timestamp('last_verified_at').defaultNow().notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow().notNull()
})

export const sessionRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}))

export const verifications = pgTable('verifications', {
	id: serial('id').primaryKey(),
	code: varchar('code', { length: 64 }).notNull(),
	userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
})

export const verificationRelations = relations(verifications, ({ one }) => ({
	user: one(users, {
		fields: [verifications.userId],
		references: [users.id]
	})
}))