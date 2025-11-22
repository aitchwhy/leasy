import { TenantExcelRow, UtilityReadingExcelRow } from './validators';
import { buildings, units, tenants, leases, utilityMeters, utilityReadings } from '@leasy/db';

type InsertBuilding = typeof buildings.$inferInsert;
type InsertUnit = typeof units.$inferInsert;
type InsertTenant = typeof tenants.$inferInsert;
type InsertLease = typeof leases.$inferInsert;
type InsertUtilityReading = typeof utilityReadings.$inferInsert;

export class TransformerService {

  transform(data: { tenants: TenantExcelRow[], readings: UtilityReadingExcelRow[] }) {
    const buildingMap = new Map<string, InsertBuilding>();
    const unitMap = new Map<string, InsertUnit>();
    const tenantMap = new Map<string, InsertTenant>();
    const leaseList: any[] = [];
    const readingList: any[] = [];

    // Default Building
    const defaultBuilding: InsertBuilding = {
      name: 'SBNC Building', // Inferred from file name
      address: 'Seoul, Korea',
    };
    buildingMap.set('default', defaultBuilding);

    // Process Tenants/Leases
    for (const row of data.tenants) {
      // Unit
      const unitNum = String(row.unit_number).replace(/[^0-9B]/g, '');
      if (!unitMap.has(unitNum)) {
        unitMap.set(unitNum, {
          buildingId: 0, // Placeholder
          unitNumber: unitNum,
          areaSqm: '0', // Not in Rent Roll, maybe default or update later
        });
      }

      // Tenant
      if (row.tenant_name) {
        tenantMap.set(row.tenant_name, {
          name: row.tenant_name,
          // businessRegistrationId: row.business_id, // Not in Rent Roll
          // contactPhone: row.contact_phone, // Not in Rent Roll
        });

        // Lease
        const startDate = this.formatDate(row.start_date);
        const endDate = row.end_date ? this.formatDate(row.end_date) : null;

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
          baseRentKrw: String(row.base_rent),
          managementFeeKrw: String(row.management_fee),
          depositKrw: String(row.deposit),
          isActive,
        });
      }
    }

    // Process Readings
    // We need to link readings to units. We'll store them with unitNumber for now.
    for (const row of data.readings) {
        const unitNum = String(row.unit_number).replace(/[^0-9B]/g, '');

        // Ensure unit exists (it should if tenant list is complete, but maybe vacant units)
        if (!unitMap.has(unitNum)) {
             unitMap.set(unitNum, {
                buildingId: 0,
                unitNumber: unitNum,
                areaSqm: '0',
            });
        }

        // We assume readings are for the "current" month or initial setup.
        // If reading_date is missing, default to today or specific date.
        const readingDate = row.reading_date ? this.formatDate(row.reading_date) : this.formatDate(new Date());

        readingList.push({
            unitNumber: unitNum,
            readingDate,
            electricityValue: Number(row.electricity_reading),
            waterValue: Number(row.water_reading),
        });
    }

    return {
      buildings: Array.from(buildingMap.values()),
      units: Array.from(unitMap.values()),
      tenants: Array.from(tenantMap.values()),
      leases: leaseList,
      readings: readingList,
    };
  }

  transformReadingsRaw(rawData: any[][]): { readings: any[] } {
    const readings: any[] = [];
    let currentSection: 'ELECTRICITY' | 'WATER' | null = null;
    let unitColumns: { [index: number]: string } = {};

    // Iterate through rows
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0) continue;

      const firstCell = String(row[0] || '').trim();

      // Detect Section Headers
      if (firstCell.includes('전기계량')) {
        console.log('Found ELECTRICITY section');
        currentSection = 'ELECTRICITY';
        unitColumns = {}; // Reset columns
        for (let j = 1; j < row.length; j++) {
            const val = row[j];
            if (val && (String(val).startsWith('B') || !isNaN(Number(val)))) {
                unitColumns[j] = String(val);
            }
        }
        console.log(`Captured unit columns for ELECTRICITY: ${JSON.stringify(unitColumns)}`);
        continue;
      } else if (firstCell.includes('수도지침')) {
        console.log('Found WATER section');
        currentSection = 'WATER';
        unitColumns = {};
        for (let j = 1; j < row.length; j++) {
            const val = row[j];
            if (val && (String(val).startsWith('B') || !isNaN(Number(val)))) {
                unitColumns[j] = String(val);
            }
        }
        console.log(`Captured unit columns for WATER: ${JSON.stringify(unitColumns)}`);
        continue;
      }

      // Process Data Rows
      if (currentSection && (firstCell.endsWith('일') || !isNaN(Number(firstCell)))) {
         // console.log(`Processing data row: ${firstCell}`);
         const day = parseInt(firstCell.replace('일', ''));
         if (isNaN(day)) continue;

         // Iterate over captured columns
         for (const [colIndex, unitNum] of Object.entries(unitColumns)) {
             const val = row[Number(colIndex)];
             if (val !== undefined && val !== null && val !== '') {
                 readings.push({
                     unitNumber: unitNum,
                     readingDate: `2024-01-${String(day).padStart(2, '0')}`, // Placeholder date
                     type: currentSection,
                     value: Number(val)
                 });
             }
         }
      }
    }

    return { readings };
  }

  private formatDate(dateInput: string | Date): string {
    if (dateInput instanceof Date) {
      return dateInput.toISOString().split('T')[0];
    }
    // Handle YYYY.MM.DD or YYYY-MM-DD
    return dateInput.replace(/\./g, '-');
  }
}
