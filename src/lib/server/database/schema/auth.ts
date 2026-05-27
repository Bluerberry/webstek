
import { relations } from 'drizzle-orm'
import { pgTable, serial, varchar, integer, timestamp } from 'drizzle-orm/pg-core'
import { users } from './user'

export const sessions = pgTable('sessions', {
    id: varchar('id', { length: 64 })
        .primaryKey(),
    token: varchar('token', { length: 64 })
        .notNull(),
    userId: integer('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    country:  varchar('country', { length: 256 }),
    browserName: varchar('browser_name', { length: 256 }),
    browserVersion: varchar('browser_version', { length: 256 }),
    lastValidatedAt: timestamp('last_validated_at', { withTimezone: true })
        .notNull()
        .defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow()
})

export const sessionRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id]
    })
}))

export const emailVerifications = pgTable('email_verifications', {
    id: serial('id')
        .primaryKey(),
    code: varchar('code', { length: 8 })
        .notNull(),
    userId: integer('user_id')
        .notNull()
        .unique()
        .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow()
})

export const emailVerificationRelations = relations(emailVerifications, ({ one }) => ({
    user: one(users, {
        fields: [emailVerifications.userId],
        references: [users.id]
    })
}))

export const passwordResets = pgTable('password_resets', {
    id: serial('id')
        .primaryKey(),
    code: varchar('code', { length: 8 })
        .notNull(),
    userId: integer('user_id')
        .notNull()
        .unique()
        .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow()
})

export const passwordResetRelations = relations(passwordResets, ({ one }) => ({
    user: one(users, {
        fields: [passwordResets.userId],
        references: [users.id]
    })
}))