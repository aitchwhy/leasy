import { Hono } from 'hono';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { units, buildings, utilityMeters } from '@leasy/db';
import { eq } from 'drizzle-orm';
import { env } from '@leasy/config';

const app = new Hono();

app.get('/', async (c) => {
  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql);

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
