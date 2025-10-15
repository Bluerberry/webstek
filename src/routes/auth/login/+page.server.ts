
import { loginSchema } from '$lib/validation/auth';
import { zod4 } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms';
import { User, Session } from '$lib/server/controllers';
import { validatePassword } from '$lib/server/utility/auth';

import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	return {
		loginForm: await superValidate(zod4(loginSchema))
	}
};

export const actions: Actions = {
    'login': async event => {

        // Validate request
        const data = await event.request.formData();
        const form = await superValidate(data, zod4(loginSchema));
        if (!form.valid) return message(form, 'Bad request', { status: 400 });

        // Check if already logged in
        if (event.locals.user) {
            return message(form, 'Already logged in');
        }

        // Validate credentials
        const user = await User.findByEmail(form.data.email);
        if (!user) return message(form, 'Bad credentials', { status: 401 });
        const valid = await validatePassword(form.data.password, user.password);
        if (!valid) return message(form, 'Bad credentials', { status: 401 });

        // Login
        const { token } = await Session.create(user.id);
        Session.setCookie(event, token);
        User.setLocals(event, user)

        return message(form, 'Successfully logged in');
    }
};