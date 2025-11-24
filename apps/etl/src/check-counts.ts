import { db } from '@leasy/db';
import { buildings, units, tenants, leases } from '@leasy/db';
import { count } from 'drizzle-orm';

async function main() {
  const bCount = await db.select({ count: count() }).from(buildings);
  const uCount = await db.select({ count: count() }).from(units);
  const tCount = await db.select({ count: count() }).from(tenants);
  const lCount = await db.select({ count: count() }).from(leases);

  console.log('Buildings:', bCount[0].count);
  console.log('Units:', uCount[0].count);
  console.log('Tenants:', tCount[0].count);
  console.log('Leases:', lCount[0].count);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
