
import { relations } from 'drizzle-orm'
import { pgTable, serial, varchar, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core'
import { sessions, emailVerifications, passwordResets } from './auth'
import { ucbRecipes } from './underworld-cookbook'

export const userRole = pgEnum('user_role', ['user', 'admin'])

export const users = pgTable('users', {
    id: serial('id')
        .primaryKey(),
    email: varchar('email', { length: 256 })
        .notNull()
        .unique(),
    verified: boolean('verified')
        .notNull()
        .default(false),
    username: varchar('username', { length: 256 })
        .notNull(),
    password: varchar('password', { length: 256 })
        .notNull(),
    role: userRole()
        .notNull()
        .default('user'),
    collectMetadata: boolean('collect_metadata')
        .notNull()
        .default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow()
})

export const userRelations = relations(users, ({ one, many }) => ({
    sessions: many(sessions, { relationName: 'sessions' }),
    emailVerification: one(emailVerifications),
    passwordReset: one(passwordResets),
    recipes: many(ucbRecipes, { relationName: 'recipes' }),
    likedRecipes: many(ucbRecipes, { relationName: 'liked_recipes' })
}))