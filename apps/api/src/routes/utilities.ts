import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { utilityReadingSchema } from '@leasy/validators';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { utilityReadings } from '@leasy/db';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { getDb, Bindings } from '../lib/db';
import { z } from 'zod';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/readings', async (c) => {
  const meterId = c.req.query('meterId');
  const startDate = c.req.query('startDate');
  const endDate = c.req.query('endDate');
  const db = getDb(c);

  let query = db.select().from(utilityReadings as any).$dynamic();

  if (meterId) {
    query = query.where(eq(utilityReadings.meterId as any, Number(meterId)));
  }

  if (startDate) {
    query = query.where(gte(utilityReadings.readingDate as any, startDate));
  }

  if (endDate) {
    query = query.where(lte(utilityReadings.readingDate as any, endDate));
  }

  const result = await query.orderBy(desc(utilityReadings.readingDate as any));
  return c.json(result);
});

app.get('/readings/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

  const db = getDb(c);
  const result = await db.select().from(utilityReadings as any).where(eq(utilityReadings.id as any, id));

  if (result.length === 0) return c.json({ error: 'Reading not found' }, 404);
  return c.json(result[0]);
});

app.delete('/readings/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

  const db = getDb(c);
  const result = await db.delete(utilityReadings as any).where(eq(utilityReadings.id as any, id)).returning() as any[];

  if (result.length === 0) return c.json({ error: 'Reading not found' }, 404);
  return c.json({ message: 'Reading deleted', id });
});

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
