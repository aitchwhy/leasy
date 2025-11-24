import { db, buildings, units, tenants, leases, utilityMeters, eq } from '@leasy/db';
import { ParserService } from './parser.service';
import { TransformerService } from './transformer.service';
import * as path from 'path';


async function main() {
  console.log('🚀 Starting ETL Process...');

  const parser = new ParserService();
  const transformer = new TransformerService();

  // Path to CSV - assuming passed as arg or default
  const csvPath = process.argv[2] || path.join(__dirname, '../data/PNL임대료.csv');
  console.log(`Reading CSV from: ${csvPath}`);

  try {
    const grid = parser.parse(csvPath);
    const extractedData = transformer.transform(grid);

    console.log(`Found ${extractedData.length} records to process.`);

    for (const data of extractedData) {
      await db.transaction(async (tx) => {
        // 1. Upsert Building
        // For simplicity, we assume one building for now or check by name
        let buildingId: number;
        const existingBuilding = await tx.select().from(buildings).where(eq(buildings.name, data.building.name)).limit(1);

        if (existingBuilding.length > 0) {
          buildingId = existingBuilding[0].id;
        } else {
          const [newBuilding] = await tx.insert(buildings).values({
            name: data.building.name,
            address: data.building.address,
            electricityCustomerId: data.building.electricityCustomerId,
            waterCustomerId: data.building.waterCustomerId,
          }).returning();
          buildingId = newBuilding.id;
        }

        // 2. Upsert Unit
        let unitId: number;
        // Check by unitNumber and buildingId
        // We don't have a composite unique constraint in the schema object easily accessible for upsert conflict target inference sometimes,
        // so we'll do check-then-insert for safety or use onConflictDoUpdate if constraint is named.
        // Schema has `buildingUnitUnique`.

        const [upsertedUnit] = await tx.insert(units).values({
          buildingId,
          unitNumber: data.unit.unitNumber,
          areaSqm: data.unit.areaSqm,
        }).onConflictDoUpdate({
          target: [units.buildingId, units.unitNumber],
          set: { areaSqm: data.unit.areaSqm }
        }).returning();
        unitId = upsertedUnit.id;

        // 3. Upsert Tenant
        let tenantId: number;
        // Business ID might be null, so careful with unique constraint
        if (data.tenant.businessRegistrationId) {
             const [upsertedTenant] = await tx.insert(tenants).values({
                name: data.tenant.name,
                businessRegistrationId: data.tenant.businessRegistrationId,
             }).onConflictDoUpdate({
                target: tenants.businessRegistrationId,
                set: { name: data.tenant.name }
             }).returning();
             tenantId = upsertedTenant.id;
        } else {
            // If no business ID, we might create a new tenant or try to match by name (risky)
            // For now, create new if name doesn't exist? Or just insert.
            // Let's insert for now.
            const [newTenant] = await tx.insert(tenants).values({
                name: data.tenant.name,
            }).returning();
            tenantId = newTenant.id;
        }

        // 4. Create Lease
        // We want the "current" lease.
        // We'll check if there is an active lease for this unit/tenant.
        // If not, create one.
        // Simplified logic: Deactivate old leases for this unit? Or just insert new one.
        // Let's insert a new active lease.
        await tx.insert(leases).values({
            unitId,
            tenantId,
            startDate: data.lease.startDate || '2024-01-01',
            baseRentKrw: data.lease.baseRentKrw,
            depositKrw: data.lease.depositKrw,
            isActive: true,
        });

        // 5. Initialize Utility Meters
        // Check if meters exist
        const existingMeters = await tx.select().from(utilityMeters).where(eq(utilityMeters.unitId, unitId));
        if (existingMeters.length === 0) {
            await tx.insert(utilityMeters).values([
                { unitId, type: 'ELECTRICITY' },
                { unitId, type: 'WATER' }
            ]);
        }
      });
    }

    console.log('✅ ETL Process Completed Successfully.');
  } catch (error) {
    console.error('❌ ETL Process Failed:', error);
    process.exit(1);
  }
}

main();
