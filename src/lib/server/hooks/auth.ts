
import { User, Session } from '$lib/server/controllers';

import type { Handle } from '@sveltejs/kit';

export const auth: Handle = async ({ event, resolve }) => {

    // Get session
    const session = await Session.findByCookie(event);
    if (!session) {
        Session.clearCookie(event);
        User.clearLocals(event);
        return resolve(event);
    }

    // Check if expired
    const timeLeft = session.expires_at.getTime() - Date.now();
    if (timeLeft <= 0) {
        Session.clearCookie(event);
        User.clearLocals(event);
        return resolve(event);
    }
    
    // Check if should rotate
    if (timeLeft <= Session.rotateBefore) {
        Session.destroy(session.id);
        const { token } = await Session.create(session.user_id);
        Session.setCookie(event, token);
    }

    // Login
    const user = await User.findByID(session.user_id);
    if (!user) throw new Error('Invalid userID associated with valid session');
    User.setLocals(event, user);

    return resolve(event);
}
