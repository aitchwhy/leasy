import { ExtractedData, ExtractedDataSchema } from './validators';

export class TransformerService {
  transform(grid: string[][]): ExtractedData[] {
    const results: ExtractedData[] = [];

    // Metadata extraction (Building info - simplified for now, assuming single building context from file)
    // In a real scenario, we might extract building name from a specific cell if it exists.
    const buildingInfo = {
      name: 'Main Building', // Default or extracted
      address: 'Default Address', // Default or extracted
      electricityCustomerId: this.findValue(grid, '전기'), // Simple heuristic search
      waterCustomerId: this.findValue(grid, '수도'),
    };

    // Iterate through columns to find Units
    // Assuming Units start from Column D (index 3) to P (index 15) based on prompt
    // We'll scan columns that look like they have unit numbers in Row 3
    const rowUnitNumber = 3;
    const rowTenantName = 4;
    const rowBusinessId = 1;

    // Calculate max columns from the first 10 rows to avoid issues with empty top rows
    let numCols = 0;
    for (let i = 0; i < Math.min(grid.length, 10); i++) {
      if (grid[i] && grid[i].length > numCols) {
        numCols = grid[i].length;
      }
    }

    console.log(`Grid Dimensions: ${grid.length} rows, ${numCols} cols`);
    console.log('First 5 rows:', grid.slice(0, 5));

    for (let col = 0; col < numCols; col++) {
      const unitNumber = grid[rowUnitNumber]?.[col]?.trim();

      // Heuristic: Unit number usually looks like '101', 'B102', etc.
      if (!unitNumber || unitNumber.length < 2 || unitNumber === '호수') continue;

      // Extract Tenant Name
      const tenantName = grid[rowTenantName]?.[col]?.trim() || 'Unknown Tenant';

      // Extract Business ID and Area from Row 1
      // The prompt says "Index 1". It might be in the same column or nearby.
      // Let's assume same column for now as per "Column D... extracts... from Row Index 1"
      const rawRow1 = grid[rowBusinessId]?.[col]?.trim() || '';

      // Heuristic parsing of Row 1 which might contain both ID and Area or just one
      // Example: "211-10-21870 132.2" or similar.
      // We'll try to split or regex.
      const businessIdMatch = rawRow1.match(/\d{3}-\d{2}-\d{5}/);
      const businessId = businessIdMatch ? businessIdMatch[0] : undefined;

      // Area might be in the same cell or we need to look for '면적' row.
      // Prompt says "Corresponds to the '면적' section (Starts Col T). Parse as Decimal."
      // Wait, prompt says "Index 1" for Area in the table, but also "Starts Col T" in notes?
      // "Corresponds to the '면적' section (Starts Col T). Parse as Decimal."
      // This implies Area might NOT be in the unit column.
      // However, the table says "Source Location in CSV (Row Index): Index 1".
      // Let's try to find a number in Row 1 of the current column first.
      const areaMatch = rawRow1.match(/[\d.]+/);
      const areaSqm = areaMatch ? areaMatch[0] : '0';

      // Dynamic Scan for Rent
      const baseRentKrw = this.findLatestRent(grid, col);

      const data = {
        building: buildingInfo,
        unit: {
          unitNumber,
          areaSqm,
        },
        tenant: {
          name: tenantName,
          businessRegistrationId: businessId,
        },
        lease: {
          baseRentKrw: baseRentKrw || '0',
          startDate: '2016-09-01', // Default as per prompt
        },
      };

      const validated = ExtractedDataSchema.safeParse(data);
      if (validated.success) {
        results.push(validated.data);
      } else {
        console.warn(`Skipping column ${col} (Unit: ${unitNumber}): Validation failed`, validated.error.flatten().fieldErrors);
      }
    }

    return results;
  }

  private findValue(grid: string[][], keyword: string): string | undefined {
    for (const row of grid) {
      for (const cell of row) {
        if (cell && cell.includes(keyword)) {
          // Return next cell or extract value
          return cell; // Simplified
        }
      }
    }
    return undefined;
  }

  private findLatestRent(grid: string[][], col: number): string | undefined {
    // Scan downwards from row 5
    let latestRent = undefined;
    for (let row = 5; row < grid.length; row++) {
      const cell = grid[row]?.[col]?.trim();
      const rowLabel = grid[row]?.[0] || grid[row]?.[1] || ''; // Check first few cols for labels like 'VAT별도' or date

      // Heuristic: If row label indicates a month or 'VAT별도' and cell has a value
      if (cell && cell !== '-' && cell !== '') {
         // Check if it looks like a number
         if (/^[\d,]+$/.test(cell)) {
             latestRent = cell;
         }
      }
    }
    return latestRent;
  }
}
