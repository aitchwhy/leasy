import { ParserService } from './parser.service';
import { TransformerService } from './transformer.service';
import { TenantExcelSchema, UtilityReadingExcelSchema, TenantExcelRow } from './validators';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { buildings, units, tenants, leases, utilityMeters, utilityReadings } from '@leasy/db';
import { eq } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function main() {
  console.log('Starting ETL process...');

  const dataDir = 'docs'; // Changed from docs/data to docs as files are in docs root
  const parser = new ParserService(dataDir);
  const transformer = new TransformerService();

  // 1. Parse
  console.log('Parsing Excel files...');

  // Parse Tenants from SBNC Budget.xlsx
  const tenantRowsRaw = await parser.parseExcelRaw(
    'SBNC Budget.xlsx',
    '임차인요약'
  );

  const tenantRows: TenantExcelRow[] = [];
  let startRowIndex = -1;

  // Find header row
  for (let i = 0; i < tenantRowsRaw.length; i++) {
    const row = tenantRowsRaw[i];
    if (row && row[0] === '호수') {
      startRowIndex = i + 1;
      break;
    }
  }

  if (startRowIndex !== -1) {
    for (let i = startRowIndex; i < tenantRowsRaw.length; i++) {
      const row = tenantRowsRaw[i];
      if (!row || !row[0] || row[0] === 'Sum') continue; // Skip empty or sum rows

      const unitNum = String(row[0]);
      const tenantName = String(row[1] || '');
      const deposit = Number(row[2] || 0) * 10000; // Man-won to Won
      const rent = Number(row[3] || 0) * 10000; // Man-won to Won
      const startDate = row[5] ? String(row[5]) : '2024-01-01'; // Default if missing

      tenantRows.push({
        unit_number: unitNum,
        tenant_name: tenantName,
        start_date: startDate,
        base_rent: rent,
        management_fee: 0, // Default
        deposit: deposit,
      } as any); // Cast to any to match TenantExcelRow structure loosely if needed, or let it infer
    }
  }
  console.log(`Parsed ${tenantRows.length} tenant rows.`);

  // Parse Readings from leasy-example-invoice-data-sbnc-budget-1.xlsx
  const readingRowsRaw = await parser.parseExcelRaw(
    'leasy-example-invoice-data-sbnc-budget-1.xlsx',
    '2024' // Sheet name from inspection
  );
  console.log(`Parsed ${readingRowsRaw.length} raw reading rows.`);

  // 2. Transform
  console.log('Transforming data...');
  const data = transformer.transform({ tenants: tenantRows, readings: [] }); // Pass empty readings to main transform
  const readingData = transformer.transformReadingsRaw(readingRowsRaw); // Transform raw readings separately

  // 3. Seed (Idempotent)
  console.log('Seeding database...');

  // Seed Building
  let buildingId: number;
  const existingBuilding = await db.select().from(buildings as any).limit(1);
  if (existingBuilding.length > 0) {
    buildingId = existingBuilding[0].id;
    console.log(`Using existing building ID: ${buildingId}`);
  } else {
    const res = await db.insert(buildings as any).values(data.buildings[0]).returning({ id: buildings.id as any });
    buildingId = Number(res[0].id);
    console.log(`Created new building ID: ${buildingId}`);
  }

  // Seed Units
  const unitIdMap = new Map<string, number>();
  for (const unit of data.units) {
    const existing = await db.select().from(units as any).where(eq(units.unitNumber as any, unit.unitNumber));
    if (existing.length > 0) {
      unitIdMap.set(unit.unitNumber, Number(existing[0].id));
    } else {
      const res = await db.insert(units as any).values({ ...unit, buildingId }).returning({ id: units.id as any });
      unitIdMap.set(unit.unitNumber, Number(res[0].id));

      // Create Utility Meters for new unit
      await db.insert(utilityMeters as any).values([
        { unitId: res[0].id, type: 'ELECTRICITY' },
        { unitId: res[0].id, type: 'WATER' },
      ]);
    }
  }
  console.log(`Seeded ${unitIdMap.size} units.`);

  // Seed Tenants
  const tenantIdMap = new Map<string, number>();
  for (const tenant of data.tenants) {
    const existing = await db.select().from(tenants as any).where(eq(tenants.name as any, tenant.name));
    if (existing.length > 0) {
      tenantIdMap.set(tenant.name, Number(existing[0].id));
    } else {
      const res = await db.insert(tenants as any).values(tenant).returning({ id: tenants.id as any });
      tenantIdMap.set(tenant.name, Number(res[0].id));
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
        const existing = await db.select().from(leases as any)
            .where(eq(leases.unitId as any, uId))
            // .where(eq(leases.tenantId, tId))
            .limit(1);

        if (existing.length === 0) {
            await db.insert(leases as any).values({
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

  // Seed Readings
  let readingCount = 0;
  for (const reading of readingData.readings) {
      const uId = unitIdMap.get(reading.unitNumber);
      if (uId !== undefined) {
          // Get meters for this unit
          const meters = await db.select().from(utilityMeters as any).where(eq(utilityMeters.unitId as any, uId));
          const meter = meters.find((m: any) => m.type === reading.type);

          if (meter) {
              // Check if reading exists
              const existing = await db.select().from(utilityReadings as any)
                  .where(eq(utilityReadings.meterId as any, meter.id))
                  // .where(eq(utilityReadings.readingDate, reading.readingDate)) // Date comparison might be tricky
                  .limit(1);

              // For MVP, just insert if no reading for this meter on this date?
              // Or just insert blindly for now? Let's insert blindly but maybe catch unique constraint if any?
              // Schema doesn't enforce unique date per meter yet probably.

              await db.insert(utilityReadings as any).values({
                  meterId: meter.id,
                  readingDate: reading.readingDate,
                  value: String(reading.value), // Convert number to string for decimal
              });
              readingCount++;
          }
      }
  }
  console.log(`Seeded ${readingCount} readings.`);

  console.log('ETL process complete.');
}

main().catch(console.error);
