import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

export class ParserService {
  constructor(private dataDir: string) {}

  async parseExcel<T>(filename: string, sheetName: string | undefined, schema: z.ZodSchema<T>, mapper: (row: any) => any): Promise<T[]> {
    const filePath = path.join(this.dataDir, filename);

    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: File ${filename} not found in ${this.dataDir}`);
      return [];
    }

    const workbook = XLSX.readFile(filePath, { cellDates: true });
    let sheet: XLSX.WorkSheet;

    if (sheetName && workbook.Sheets[sheetName]) {
      sheet = workbook.Sheets[sheetName];
    } else {
      // Default to first sheet if not specified or not found
      const firstSheetName = workbook.SheetNames[0];
      sheet = workbook.Sheets[firstSheetName];
      console.log(`Sheet ${sheetName} not found, using first sheet: ${firstSheetName}`);
    }

    const jsonData = XLSX.utils.sheet_to_json(sheet);
    const results: T[] = [];

    for (const row of jsonData) {
      try {
        const mappedRow = mapper(row);
        // Skip empty rows (e.g. if mappedRow is null)
        if (!mappedRow) continue;

        const parsed = schema.parse(mappedRow);
        results.push(parsed);
      } catch (e) {
        console.error(`Validation error for row: ${JSON.stringify(row)}`, e);
      }
    }

    return results;
  }

  async parseExcelRaw(filename: string, sheetName?: string): Promise<any[][]> {
    const filePath = path.join(this.dataDir, filename);

    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: File ${filename} not found in ${this.dataDir}`);
      return [];
    }

    const workbook = XLSX.readFile(filePath, { cellDates: true });
    let sheet: XLSX.WorkSheet;

    if (sheetName && workbook.Sheets[sheetName]) {
      sheet = workbook.Sheets[sheetName];
    } else {
      const firstSheetName = workbook.SheetNames[0];
      sheet = workbook.Sheets[firstSheetName];
    }

    return XLSX.utils.sheet_to_json(sheet, { header: 1 });
  }
}
