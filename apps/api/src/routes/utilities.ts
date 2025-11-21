import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { utilityReadingSchema } from '@leasy/validators';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { utilityReadings } from '@leasy/db';
import { env } from '@leasy/config';
import { z } from 'zod';

const app = new Hono();

app.post('/readings', zValidator('json', z.array(utilityReadingSchema)), async (c) => {
  const data = c.req.valid('json');
  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql);

  if (data.length === 0) {
      return c.json({ message: 'No readings provided' }, 400);
  }

  // Bulk insert
  const result = await db.insert(utilityReadings).values(data).returning();

  return c.json({ count: result.length, readings: result }, 201);
});

export default app;
