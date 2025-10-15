
import { zod4 } from 'sveltekit-superforms/adapters';
import { registerSchema } from '$lib/validation/auth';
import { User, Session } from '$lib/server/controllers';
import { message, superValidate } from 'sveltekit-superforms';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
    return {
        registerForm: await superValidate(zod4(registerSchema))
    }
};

export const actions: Actions = {
    'register': async event => {

        // Validate request
        const data = await event.request.formData();
        const form = await superValidate(data, zod4(registerSchema));
        if (!form.valid) return message(form, 'Bad request', { status: 400 });

        // Check if already logged in
        if (event.locals.user) {
            return message(form, 'Already logged in');
        }

        // Check if email exists
        let user = await User.findByEmail(form.data.email);
        if (user) return message(form, 'Email already registered', { status: 400 });

        // Register
        user = await User.create(form.data.username, form.data.email, form.data.password);

        // Login
        const { token } = await Session.create(user.id);
        Session.setCookie(event, token);
        User.setLocals(event, user)

        return message(form, 'Successfully registered');
    }
};