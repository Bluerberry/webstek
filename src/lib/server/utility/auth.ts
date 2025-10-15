
import crypto from 'crypto';
import { AUTH_SECRET } from '$env/static/private';

export function generateToken() {
	return crypto.randomBytes(32).toString('hex');
}

export function deriveTokenID(token: string) {
	return crypto
		.createHmac('sha256', AUTH_SECRET)
		.update(token)
		.digest('hex');
}

export async function hashToken(token: string) {
	return crypto
		.createHash('sha256')
		.update(token)
		.digest('hex');
}

export async function validateToken(token: string, reference: string) {
	const hash = await hashToken(token);
	const a = Buffer.from(hash);
	const b = Buffer.from(reference);
	return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function hashPassword(password: string): Promise<string> {
	return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString('hex');
        crypto.scrypt(password, salt, 64, (error, hash) => {
            if (error) reject(error);
            resolve(salt + ':' + hash.toString('hex'));
        });
    });
}

export function validatePassword(password: string, reference: string): Promise<boolean> {
	return new Promise((resolve, reject) => {
        const [salt, hash] = reference.split(":");
        crypto.scrypt(password, salt, 64, (error, b) => {
            if (error) reject(error);
			const a = Buffer.from(hash, 'hex');
            resolve(a.length === b.length && crypto.timingSafeEqual(a, b));
        });
    });
}