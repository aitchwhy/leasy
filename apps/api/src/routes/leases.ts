import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createLeaseSchema, updateLeaseSchema } from '@leasy/validators';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { leases } from '@leasy/db';
import { eq, and, ne } from 'drizzle-orm';
import { env } from '@leasy/config';

const app = new Hono();

app.get('/', async (c) => {
  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql);
  const unitId = c.req.query('unitId');
  const tenantId = c.req.query('tenantId');

  let query = db.select().from(leases).$dynamic();

  if (unitId) {
    query = query.where(eq(leases.unitId, Number(unitId)));
  }
  if (tenantId) {
      // If both are present, we need AND logic.
      // Drizzle dynamic queries are a bit tricky with multiple wheres if not chained carefully.
      // But chaining .where() adds AND.
    query = query.where(eq(leases.tenantId, Number(tenantId)));
  }

  const result = await query;
  return c.json(result);
});

app.post('/', zValidator('json', createLeaseSchema), async (c) => {
  const data = c.req.valid('json');
  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql);

  // Domain Logic: Check for overlapping active leases for the same unit
  if (data.isActive) {
      const existing = await db.select().from(leases)
        .where(and(
            eq(leases.unitId, data.unitId),
            eq(leases.isActive, true)
        ));

      if (existing.length > 0) {
          return c.json({ error: 'Unit already has an active lease' }, 409);
      }
  }

  const result = await db.insert(leases).values(data).returning();
  return c.json(result[0], 201);
});

app.put('/:id', zValidator('json', updateLeaseSchema), async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

  const data = c.req.valid('json');
  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql);

  // Domain Logic: If setting to active, check for overlaps (excluding self)
  if (data.isActive === true) {
      // We need to fetch the unitId if not provided in update
      let unitId = data.unitId;
      if (!unitId) {
          const current = await db.select().from(leases).where(eq(leases.id, id));
          if (current.length === 0) return c.json({ error: 'Lease not found' }, 404);
          unitId = current[0].unitId;
      }

      const existing = await db.select().from(leases)
        .where(and(
            eq(leases.unitId, unitId!),
            eq(leases.isActive, true),
            ne(leases.id, id)
        ));

      if (existing.length > 0) {
          return c.json({ error: 'Unit already has another active lease' }, 409);
      }
  }

  const result = await db.update(leases)
    .set(data)
    .where(eq(leases.id, id))
    .returning();

  if (result.length === 0) return c.json({ error: 'Lease not found' }, 404);
  return c.json(result[0]);
});

export default app;
