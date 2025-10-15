
import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config();
if (!process.env.DATABASE_URL) throw new Error('Missing DATABASE_URL in .env');

export default defineConfig({
    schema: './src/lib/server/database/schema.ts',
    dialect: 'postgresql',
    out: './drizzle',
    dbCredentials: {
        url: process.env.DATABASE_URL
    }
});