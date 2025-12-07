
import { z } from 'zod';

export const registerSchema = z.object({
	username: z.string()
		.min(1, { message: 'Username is required.' })
		.max(20, { message: 'Username cannot be longer than 20 chars'}),
	email: z.string()
		.min(1, { message: 'Email is required.' })
		.email({ message: 'Invalid email address.' }),
	password: z.string()
		.min(1, { message: 'Password is required.' }),
	confirmPassword: z.string()
		.min(1, { message: 'Confirm password is required.' })
})
.refine(data => data.password === data.confirmPassword, {
	message: 'Passwords do not match.',
	path: ['confirmPassword']
})

export const verifySchema = z.object({
	code: z.string()
})

export const loginSchema = z.object({
	email: z.string()
		.min(1, { message: 'Email is required.' })
		.email({ message: 'Invalid email address.' }),
	password: z.string()
		.min(1, { message: 'Password is required.' })
})