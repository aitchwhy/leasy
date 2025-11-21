import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const envSchema = z.object({
  DATABASE_URL: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
