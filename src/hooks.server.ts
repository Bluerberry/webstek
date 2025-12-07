
import { sequence } from '@sveltejs/kit/hooks';
import { flow, auth } from '$lib/server/hooks';

export const handle = sequence(flow, auth);
