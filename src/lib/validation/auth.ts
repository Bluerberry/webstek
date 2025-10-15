
import z from 'zod';

export const loginSchema = z.object({
    email: z.email(),
    password: z.string()
});

export const registerSchema = z.object({
    username: z.string(),
    email: z.email(),
    password: z.string()
})