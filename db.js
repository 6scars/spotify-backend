import postgres from 'postgres';
import env from 'dotenv';
env.config();
const DATABASE_KEY = process.env.DATABASE_KEY;

export const sql = postgres(DATABASE_KEY, { ssl: { rejectUnauthorized: false } });