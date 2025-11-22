import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { utilityReadingSchema } from '@leasy/validators';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { utilityReadings } from '@leasy/db';
import { getDb, Bindings } from '../lib/db';
import { z } from 'zod';

const app = new Hono<{ Bindings: Bindings }>();

app.post('/readings', zValidator('json', z.array(utilityReadingSchema)), async (c) => {
  const data = c.req.valid('json');
  const db = getDb(c);

  if (data.length === 0) {
      return c.json({ message: 'No readings provided' }, 400);
  }

  // Bulk insert
  const result = await db.insert(utilityReadings as any).values(data).returning() as any[];

  return c.json({ count: result.length, readings: result }, 201);
});

export default app;
