
import { relations } from 'drizzle-orm'
import { pgTable, serial, varchar, integer, timestamp, boolean } from 'drizzle-orm/pg-core'
import { recipes, recipeFavorites, recipeNotes } from '../schema'

export const users = pgTable('users', {
    id: serial('id')
        .primaryKey(),
    email: varchar('email', { length: 255 })
        .notNull()
        .unique(),
    verified: boolean('verified')
        .notNull()
        .default(false),
    username: varchar('username', { length: 255 })
        .notNull(),
    password: varchar('password', { length: 255 })
        .notNull(),
    collectMetadata: boolean('collect_metadata')
        .notNull()
        .default(true),
    createdAt: timestamp('created_at')
        .notNull()
        .defaultNow()
})

export const userRelations = relations(users, ({ one, many }) => ({
    sessions: many(sessions),
    verification: one(verifications),
    recipes: many(recipes),
    recipeNotes: many(recipeNotes),
    recipeFavorites: many(recipeFavorites)
}))

export const sessions = pgTable('sessions', {
    id: varchar('id', { length: 64 })
        .primaryKey(),
    token: varchar('token', { length: 64 })
        .notNull(),
    userId: integer('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    country:  varchar('country', { length: 255 }),
    browserName: varchar('browser_name', { length: 255 }),
    browserVersion: varchar('browser_version', { length: 255 }),
    lastValidatedAt: timestamp('last_validated_at')
        .notNull()
        .defaultNow(),
    createdAt: timestamp('created_at')
        .notNull()
        .defaultNow()
})

export const sessionRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id]
    })
}))

export const verifications = pgTable('verifications', {
    id: serial('id')
        .primaryKey(),
    code: varchar('code', { length: 64 })
        .notNull(),
    userId: integer('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at')
        .notNull()
        .defaultNow()
})

export const verificationRelations = relations(verifications, ({ one }) => ({
    user: one(users, {
        fields: [verifications.userId],
        references: [users.id]
    })
}))
