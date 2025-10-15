
import { users, sessions } from './schema';
import type { InferSelectModel } from 'drizzle-orm';

export type UserRecord = InferSelectModel<typeof users>;
export type SessionRecord = InferSelectModel<typeof sessions>;
