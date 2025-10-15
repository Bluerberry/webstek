
import { eq } from 'drizzle-orm';
import { db, users } from '$lib/server/database';
import { hashPassword } from '$lib/server/utility/auth';

import type { RequestEvent } from '@sveltejs/kit';
import type { UserRecord } from '$lib/server/database';

export class User {
    static async findByID(userID: number) {
        return db.query.users.findFirst({
            where: eq(users.id, userID)
        })
    }

    static async findByEmail(email: string) {
        return db.query.users.findFirst({
            where: eq(users.email, email)
        })
    }
    
    static async create(username: string, email: string, password: string) {
        const passwordHash = await hashPassword(password);
        const [ user ] = await db.insert(users).values({
            username: username,
            email: email,
            password: passwordHash
        }).returning();

        return user;
    }

    static async destroy(sessionID: number) {
        await db.delete(users).where(eq(users.id, sessionID));
    }

    static setLocals(event: RequestEvent, user: UserRecord) {
        event.locals.user = {
            id: user.id,
            email: user.email,
            username: user.username
        };
    }

    static clearLocals(event: RequestEvent) {
        event.locals.user = undefined;
    }
}