
import { sequence } from '@sveltejs/kit/hooks';
import { auth } from '$lib/server/hooks';

export const handle = sequence(auth);
