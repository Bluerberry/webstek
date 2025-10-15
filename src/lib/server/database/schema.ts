
import { relations } from 'drizzle-orm';

import { 
    pgTable, 
    serial, 
    integer,
    timestamp,
    text 
} from "drizzle-orm/pg-core";

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: text('username').notNull(),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    created_at: timestamp('created_at').notNull().defaultNow()
})

export const usersRelations = relations(users, ({ many }) => ({
    sessions: many(sessions)
}))

export const sessions = pgTable('sessions', {
    id: text().primaryKey(),
    hash: text().notNull(),
    user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    expires_at: timestamp('expires_at').notNull(),
    created_at: timestamp('created_at').notNull().defaultNow()
})
