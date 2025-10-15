
import { eq } from 'drizzle-orm';
import { db, sessions } from '$lib/server/database';
import { deriveTokenID, generateToken, hashToken, validateToken } from '$lib/server/utility/auth';
import { APP_ENV } from '$env/static/private';

import type { RequestEvent } from '@sveltejs/kit';

export class Session {
    static expireAfter = 7 * 24 * 60 * 60;     // 7 days (s)
    static rotateBefore = 24 * 60 * 60 * 1000; // 1 day  (ms)

    static async findByCookie(event: RequestEvent) {
        const token = event.cookies.get('sessionToken');
        if (!token) return undefined;

        const sessionID = deriveTokenID(token);
        const session = await db.query.sessions.findFirst({
            where: eq(sessions.id, sessionID)
        });

        if (!session) return undefined;
        const valid = await validateToken(token, session.hash);
        return valid ? session : undefined;
    }

    static async create(userID: number) {
        const token = generateToken();
        const tokenID = deriveTokenID(token);
        const tokenHash = await hashToken(token);

        const [ session ] = await db.insert(sessions).values({
            id: tokenID,
            hash: tokenHash,
            user_id: userID,
            expires_at: new Date(Date.now() + Session.expireAfter * 1000)
        }).returning();

        return { session, token };
    }

    static async destroy(sessionID: string) {
        await db.delete(sessions).where(eq(sessions.id, sessionID));
    }

    static setCookie(event: RequestEvent, token: string) {
        event.cookies.set('sessionToken', token, {
            path: '/',
            httpOnly: true,
            secure: APP_ENV === 'production',
            sameSite: 'lax',
            maxAge: Session.expireAfter
        });
    }

    static clearCookie(event: RequestEvent) {
        event.cookies.delete('sessionToken', { path: '/' });
    }
}