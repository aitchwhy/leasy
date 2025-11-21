import { TenantCsvRow } from './validators';
import { buildings, units, tenants, leases, utilityMeters } from '@leasy/db';
import { InferInsertModel } from 'drizzle-orm';

type InsertBuilding = InferInsertModel<typeof buildings>;
type InsertUnit = InferInsertModel<typeof units>;
type InsertTenant = InferInsertModel<typeof tenants>;
type InsertLease = InferInsertModel<typeof leases>;
type InsertUtilityMeter = InferInsertModel<typeof utilityMeters>;

export class TransformerService {

  transform(rows: TenantCsvRow[]) {
    const buildingMap = new Map<string, InsertBuilding>();
    const unitMap = new Map<string, InsertUnit>();
    const tenantMap = new Map<string, InsertTenant>();
    const leaseList: any[] = []; // We'll need to link IDs later, so we keep intermediate structure

    // Default Building
    const defaultBuilding: InsertBuilding = {
      name: 'Leasy HQ', // Default name
      address: 'Seoul, Korea',
    };
    buildingMap.set('default', defaultBuilding);

    for (const row of rows) {
      // Unit
      // Clean unit number (remove '호' etc if needed)
      const unitNum = row.unit_number.replace(/[^0-9B]/g, '');
      if (!unitMap.has(unitNum)) {
        unitMap.set(unitNum, {
          buildingId: 0, // Placeholder, will be updated
          unitNumber: unitNum,
          areaSqm: row.area ? row.area.replace(/[^0-9.]/g, '') : '0',
        });
      }

      // Tenant
      if (row.tenant_name) {
        tenantMap.set(row.tenant_name, {
          name: row.tenant_name,
          businessRegistrationId: row.business_id,
          contactPhone: row.contact_phone,
        });

        // Lease
        // Parse dates
        const startDate = this.parseDate(row.start_date);
        const endDate = row.end_date ? this.parseDate(row.end_date) : null;

        // Determine if active
        const now = new Date();
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : null;
        const isActive = start <= now && (!end || end >= now);

        leaseList.push({
          unitNumber: unitNum,
          tenantName: row.tenant_name,
          startDate,
          endDate,
          baseRentKrw: row.rent.replace(/,/g, ''),
          managementFeeKrw: row.management_fee ? row.management_fee.replace(/,/g, '') : '0',
          depositKrw: row.deposit.replace(/,/g, ''),
          isActive,
        });
      }
    }

    return {
      buildings: Array.from(buildingMap.values()),
      units: Array.from(unitMap.values()),
      tenants: Array.from(tenantMap.values()),
      leases: leaseList,
    };
  }

  private parseDate(dateStr: string): string {
    // Handle YYYY.MM.DD or YYYY-MM-DD
    return dateStr.replace(/\./g, '-');
  }
}
