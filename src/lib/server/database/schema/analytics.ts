
import { integer, pgEnum, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core'

export const requestType = pgEnum('request_type', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])

export const requests = pgTable('requests', {
    id: serial('id')
        .primaryKey(),
    type: requestType('type')
        .notNull(),
    url: varchar('path')
        .notNull(),
    responseTime: integer('response_time')
        .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow()
})

export const deletedUsers = pgTable('deleted_users', {
    id: serial('id')
        .primaryKey(),
    userCreatedAt: timestamp('created_at', { withTimezone: true })
        .notNull(),
    userDeletedAt: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow()
})