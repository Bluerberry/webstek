
import { z } from 'zod'

export const registerSchema = z.object({
	username: z.string()
		.min(1, { message: 'Username is required' })
		.max(20, { message: 'Username cannot be longer than 20 characters'}),
	email: z.string()
		.min(1, { message: 'Email is required' })
		.email({ message: 'Invalid email address' }),
	password: z.string()
		.min(1, { message: 'Password is required' })
		.min(6, { message: 'Password must be at least 6 characters'})
})

export const loginSchema = z.object({
	email: z.string()
		.min(1, { message: 'Email is required' }),
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
		.min(6, { message: 'Password must be at least 6 characters'})
})

export const requestResetPasswordSchema = z.object({
	email: z.string()
		.min(1, { message: 'Email is required' })
})

export const resetPasswordSchema = z.object({
	newPassword: z.string()
		.min(1, { message: 'New password is required' })
		.min(6, { message: 'Password must be at least 6 characters'})
})

export const verifyCodeSchema = z.object({
	code: z.string()
		.length(6, { message: 'Code must be 6 digits' })
})