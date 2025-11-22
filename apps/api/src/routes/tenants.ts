import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createTenantSchema, updateTenantSchema } from '@leasy/validators';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { tenants } from '@leasy/db';
import { eq } from 'drizzle-orm';
import { getDb, Bindings } from '../lib/db';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', async (c) => {
  const db = getDb(c);
  const result = await db.select().from(tenants as any);
  return c.json(result);
});

app.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

  const db = getDb(c);
  const result = await db.select().from(tenants as any).where(eq(tenants.id as any, id));

  if (result.length === 0) return c.json({ error: 'Tenant not found' }, 404);
  return c.json(result[0]);
});

app.post('/', zValidator('json', createTenantSchema), async (c) => {
  const data = c.req.valid('json');
  const db = getDb(c);

  try {
    const result = await db.insert(tenants as any).values(data).returning() as any[];
    return c.json(result[0], 201);
  } catch (e: any) {
    if (e.code === '23505') { // Unique constraint violation
        return c.json({ error: 'Business Registration ID already exists' }, 409);
    }
    return c.json({ error: String(e) }, 500);
  }
});

app.put('/:id', zValidator('json', updateTenantSchema), async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

  const data = c.req.valid('json');
  const db = getDb(c);

  const result = await db.update(tenants as any)
    .set(data)
    .where(eq(tenants.id as any, id))
    .returning() as any[];

  if (result.length === 0) return c.json({ error: 'Tenant not found' }, 404);
  return c.json(result[0]);
});

app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

  const db = getDb(c);
  const result = await db.delete(tenants as any).where(eq(tenants.id as any, id)).returning() as any[];

  if (result.length === 0) return c.json({ error: 'Tenant not found' }, 404);
  return c.json({ message: 'Tenant deleted', id });
});

export default app;
