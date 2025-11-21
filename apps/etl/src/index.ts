import { ParserService } from './parser.service';
import { TransformerService } from './transformer.service';
import { TenantCsvSchema } from './validators';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { buildings, units, tenants, leases, utilityMeters } from '@leasy/db';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  console.log('Starting ETL process...');

  const dataDir = 'docs/data';
  const parser = new ParserService(dataDir);
  const transformer = new TransformerService();

  // 1. Parse
  console.log('Parsing CSVs...');
  const tenantRows = await parser.parseCsv('PNL임차인.csv', TenantCsvSchema);
  console.log(`Parsed ${tenantRows.length} tenant rows.`);

  // 2. Transform
  console.log('Transforming data...');
  const data = transformer.transform(tenantRows);

  // 3. Seed (Idempotent)
  console.log('Seeding database...');

  // Seed Building
  let buildingId: number;
  const existingBuilding = await db.select().from(buildings).limit(1);
  if (existingBuilding.length > 0) {
    buildingId = existingBuilding[0].id;
    console.log(`Using existing building ID: ${buildingId}`);
  } else {
    const res = await db.insert(buildings).values(data.buildings[0]).returning({ id: buildings.id });
    buildingId = res[0].id;
    console.log(`Created new building ID: ${buildingId}`);
  }

  // Seed Units
  const unitIdMap = new Map<string, number>();
  for (const unit of data.units) {
    const existing = await db.select().from(units).where(eq(units.unitNumber, unit.unitNumber));
    if (existing.length > 0) {
      unitIdMap.set(unit.unitNumber, existing[0].id);
    } else {
      const res = await db.insert(units).values({ ...unit, buildingId }).returning({ id: units.id });
      unitIdMap.set(unit.unitNumber, res[0].id);

      // Create Utility Meters for new unit
      await db.insert(utilityMeters).values([
        { unitId: res[0].id, type: 'ELECTRICITY' },
        { unitId: res[0].id, type: 'WATER' },
      ]);
    }
  }
  console.log(`Seeded ${unitIdMap.size} units.`);

  // Seed Tenants
  const tenantIdMap = new Map<string, number>();
  for (const tenant of data.tenants) {
    const existing = await db.select().from(tenants).where(eq(tenants.name, tenant.name));
    if (existing.length > 0) {
      tenantIdMap.set(tenant.name, existing[0].id);
    } else {
      const res = await db.insert(tenants).values(tenant).returning({ id: tenants.id });
      tenantIdMap.set(tenant.name, res[0].id);
    }
  }
  console.log(`Seeded ${tenantIdMap.size} tenants.`);

  // Seed Leases
  let leaseCount = 0;
  for (const lease of data.leases) {
    const uId = unitIdMap.get(lease.unitNumber);
    const tId = tenantIdMap.get(lease.tenantName);

    if (uId !== undefined && tId !== undefined) {
        // Check if lease exists (simple check by unit + tenant + start date)
        // For MVP, we might just skip if active lease exists for unit
        const existing = await db.select().from(leases)
            .where(eq(leases.unitId, uId))
            // .where(eq(leases.tenantId, tId)) // Could add more checks
            .limit(1);

        if (existing.length === 0) {
            await db.insert(leases).values({
                unitId: uId,
                tenantId: tId,
                startDate: lease.startDate,
                endDate: lease.endDate,
                baseRentKrw: lease.baseRentKrw,
                managementFeeKrw: lease.managementFeeKrw,
                depositKrw: lease.depositKrw,
                isActive: lease.isActive,
            });
            leaseCount++;
        }
    }
  }
  console.log(`Seeded ${leaseCount} leases.`);

  console.log('ETL process complete.');
}

main().catch(console.error);
