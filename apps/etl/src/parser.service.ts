import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

export class ParserService {
  constructor(private dataDir: string) {}

  async parseCsv<T>(filename: string, schema: z.ZodSchema<T>): Promise<T[]> {
    const filePath = path.join(this.dataDir, filename);

    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: File ${filename} not found in ${this.dataDir}`);
      return [];
    }

    const content = await fs.promises.readFile(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');

    if (lines.length === 0) return [];

    // Assume first row is header
    const headers = lines[0].split(',').map(h => h.trim());
    const dataLines = lines.slice(1);

    const results: T[] = [];

    for (const line of dataLines) {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};

      headers.forEach((header, index) => {
        // Simple mapping: map header names to schema keys if possible, or use index
        // For now, we'll assume the CSV headers might not match schema keys exactly,
        // so we might need a mapper.
        // BUT, for this MVP, let's assume we map by index if headers don't match,
        // or we just try to map by header name.

        // Let's try to map by known header names to schema keys
        if (header.includes('호수')) row['unit_number'] = values[index];
        else if (header.includes('상호')) row['tenant_name'] = values[index];
        else if (header.includes('사업자')) row['business_id'] = values[index];
        else if (header.includes('연락처')) row['contact_phone'] = values[index];
        else if (header.includes('시작')) row['start_date'] = values[index];
        else if (header.includes('종료')) row['end_date'] = values[index];
        else if (header.includes('보증금')) row['deposit'] = values[index];
        else if (header.includes('임대료')) row['rent'] = values[index];
        else if (header.includes('관리비')) row['management_fee'] = values[index];
        else if (header.includes('면적')) row['area'] = values[index];
      });

      // If row is empty (parsing failed), skip or try positional
      if (Object.keys(row).length === 0) {
          // Fallback: positional mapping for Tenant CSV
          // 0: Unit, 1: Tenant, 2: Owner, 3: BizID, 4: Phone, 5: Start, 6: End, 7: Deposit, 8: Rent, 9: Mgmt
          row['unit_number'] = values[0];
          row['tenant_name'] = values[1];
          // ... add more if needed
      }

      try {
        const parsed = schema.parse(row);
        results.push(parsed);
      } catch (e) {
        console.error(`Validation error for row: ${line}`, e);
      }
    }

    return results;
  }
}
