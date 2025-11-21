import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createTenantSchema, updateTenantSchema } from '@leasy/validators';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { tenants } from '@leasy/db';
import { eq } from 'drizzle-orm';
import { env } from '@leasy/config';

const app = new Hono();

app.get('/', async (c) => {
  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql);
  const result = await db.select().from(tenants);
  return c.json(result);
});

app.post('/', zValidator('json', createTenantSchema), async (c) => {
  const data = c.req.valid('json');
  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql);

  try {
    const result = await db.insert(tenants).values(data).returning();
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
  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql);

  const result = await db.update(tenants)
    .set(data)
    .where(eq(tenants.id, id))
    .returning();

  if (result.length === 0) return c.json({ error: 'Tenant not found' }, 404);
  return c.json(result[0]);
});

export default app;
