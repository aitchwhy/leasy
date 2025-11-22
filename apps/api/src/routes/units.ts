import { Hono } from 'hono';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { units, buildings, utilityMeters } from '@leasy/db';
import { eq } from 'drizzle-orm';
import { getDb, Bindings } from '../lib/db';

const app = new Hono<{ Bindings: Bindings }>();

app.get('/', async (c) => {
  const db = getDb(c);

  const result = await db.select({
      id: units.id,
      unitNumber: units.unitNumber,
      buildingId: units.buildingId,
      buildingName: buildings.name,
      meters: utilityMeters,
  })
  .from(units)
  .leftJoin(buildings, eq(units.buildingId, buildings.id))
  .leftJoin(utilityMeters, eq(units.id, utilityMeters.unitId));

  // Group by unit since leftJoin will duplicate units for each meter
  const grouped = result.reduce((acc, row) => {
      const unit = acc.find(u => u.id === row.id);
      if (unit) {
          if (row.meters) unit.meters.push(row.meters);
      } else {
          acc.push({
              id: row.id,
              unitNumber: row.unitNumber,
              buildingId: row.buildingId,
              buildingName: row.buildingName,
              meters: row.meters ? [row.meters] : [],
          });
      }
      return acc;
  }, [] as any[]);

  return c.json(grouped);
});

export default app;
