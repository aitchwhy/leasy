import { Context } from 'hono';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@leasy/db';

export type Bindings = {
  DATABASE_URL: string;
  NODE_ENV: string;
  CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
};

export function getDb(c: Context<{ Bindings: Bindings }>) {
  const sql = neon(c.env.DATABASE_URL);
  return drizzle(sql, { schema });
}
