import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@leasy-temp/config';
import * as schema from './schema';

// Environment-aware database connection
export const createDb = () => {
  // For Cloudflare Workers (or generic HTTP-based serverless)
  // We use the neon-http driver.
  // Note: In a real Cloudflare Worker, you might need to pass the connection string from the context,
  // but here we rely on the validated env from @leasy-temp/config.
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production' && !process.env.IS_ETL) {
      const sql = neon(env.DATABASE_URL);
      return drizzle(sql, { schema });
  }

  // For Node/Bun environments (ETL, Scripts, Drizzle Kit)
  // We use the standard postgres-js driver.
  const client = postgres(env.DATABASE_URL);
  return drizzlePostgres(client, { schema });
};

export const db = createDb();

export * from './schema';
export * from 'drizzle-orm';
