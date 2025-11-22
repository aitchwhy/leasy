
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { buildings, units, tenants, leases, utilityMeters, utilityReadings } from '@leasy/db';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function verify() {
  const b = await db.select().from(buildings);
  console.log(`Buildings: ${b.length}`);

  const u = await db.select().from(units);
  console.log(`Units: ${u.length}`);

  const t = await db.select().from(tenants);
  console.log(`Tenants: ${t.length}`);
  console.log(t.map(x => x.name).sort());

  const l = await db.select().from(leases);
  console.log(`Leases: ${l.length}`);

  const r = await db.select().from(utilityReadings);
  console.log(`Readings: ${r.length}`);
}

verify().catch(console.error);
