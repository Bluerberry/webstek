
import { User, Session } from '$lib/server/controllers';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async event => {
    const session = await Session.findByCookie(event);
    if (session) await Session.destroy(session.id);
    Session.clearCookie(event);
    User.clearLocals(event);
    return new Response();
};