
import { z } from 'zod'

export const registerSchema = z.object({
	username: z.string()
		.min(1, { message: 'Username is required' })
		.max(20, { message: 'Username cannot be longer than 20 char.'}),
	email: z.string()
		.min(1, { message: 'Email is required' })
		.email({ message: 'Invalid email address' }),
	password: z.string()
		.min(1, { message: 'Password is required' })
})

export const loginSchema = z.object({
	email: z.string()
		.min(1, { message: 'Email is required' })
		.email({ message: 'Invalid email address' }),
	password: z.string()
		.min(1, { message: 'Password is required' })
})

export const changeUsernameSchema = z.object({
	newUsername: z.string()
		.min(1, { message: 'Username is required' })
		.max(20, { message: 'Username cannot be longer than 20 char.'})
})

export const changeEmailSchema = z.object({
	newEmail: z.string()
		.min(1, { message: 'Email is required' })
		.email({ message: 'Invalid email address' }),
	password: z.string()
		.min(1, { message: 'Password is required' })
})

export const changePasswordSchema = z.object({
	oldPassword: z.string()
		.min(1, { message: 'Old password is required' }),
	newPassword: z.string()
		.min(1, { message: 'New password is required' })
})

export const emailverificationSchema = z.object({
	code: z.string()
		.length(6, { message: 'Code must be 6 digits' }),
})

export const requestResetSchema = z.object({
    email: z.string()
		.min(1, { message: 'Email is required' })
		.email({ message: 'Invalid email address' }),
})

export const verifyResetSchema = z.object({
    email: z.string()
		.min(1, { message: 'Email is required' })
		.email({ message: 'Invalid email address' }),
    code: z.string()
		.length(6, { message: 'Code must be 6 digits' }),
})

export const resetPasswordSchema = z.object({
   email: z.string()
		.min(1, { message: 'Email is required' })
		.email({ message: 'Invalid email address' }),
    code: z.string()
		.length(6, { message: 'Code must be 6 digits' }),
    newPassword: z.string()
		.min(1, { message: 'New password is required' })
})