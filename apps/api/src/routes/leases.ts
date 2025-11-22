import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createLeaseSchema, updateLeaseSchema } from '@leasy/validators';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { leases } from '@leasy/db';
import { eq, and, ne } from 'drizzle-orm';
import { getDb, Bindings } from '../lib/db';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', async (c) => {
  const db = getDb(c);
  const unitId = c.req.query('unitId');
  const tenantId = c.req.query('tenantId');

  let query = db.select().from(leases as any).$dynamic();

  if (unitId) {
    query = query.where(eq(leases.unitId as any, Number(unitId)));
  }
  if (tenantId) {
      // If both are present, we need AND logic.
      // Drizzle dynamic queries are a bit tricky with multiple wheres if not chained carefully.
      // But chaining .where() adds AND.
    query = query.where(eq(leases.tenantId as any, Number(tenantId)));
  }

  const result = await query;
  return c.json(result);
});

app.post('/', zValidator('json', createLeaseSchema), async (c) => {
  const data = c.req.valid('json');
  const db = getDb(c);

  // Domain Logic: Check for overlapping active leases for the same unit
  if (data.isActive) {
      const existing = await db.select().from(leases as any)
        .where(and(
            eq(leases.unitId as any, data.unitId),
            eq(leases.isActive as any, true)
        ));

      if (existing.length > 0) {
          return c.json({ error: 'Unit already has an active lease' }, 409);
      }
  }

  const result = await db.insert(leases as any).values(data).returning() as any[];
  return c.json(result[0], 201);
});

app.put('/:id', zValidator('json', updateLeaseSchema), async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

  const data = c.req.valid('json');
  const db = getDb(c);

  // Domain Logic: If setting to active, check for overlaps (excluding self)
  if (data.isActive === true) {
      // We need to fetch the unitId if not provided in update
      let unitId = data.unitId;
      if (!unitId) {
          const current = await db.select().from(leases as any).where(eq(leases.id as any, id));
          if (current.length === 0) return c.json({ error: 'Lease not found' }, 404);
          unitId = current[0].unitId;
      }

      const existing = await db.select().from(leases as any)
        .where(and(
            eq(leases.unitId as any, unitId!),
            eq(leases.isActive as any, true),
            ne(leases.id as any, id)
        ));

      if (existing.length > 0) {
          return c.json({ error: 'Unit already has another active lease' }, 409);
      }
  }

  const result = await db.update(leases as any)
    .set(data)
    .where(eq(leases.id as any, id))
    .returning() as any[];

  if (result.length === 0) return c.json({ error: 'Lease not found' }, 404);
  return c.json(result[0]);
});

app.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

  const db = getDb(c);
  const result = await db.delete(leases as any).where(eq(leases.id as any, id)).returning() as any[];

  if (result.length === 0) return c.json({ error: 'Lease not found' }, 404);
  return c.json({ message: 'Lease deleted', id });
});

export default app;
