import * as fs from 'fs';
import Papa from 'papaparse';

export class ParserService {
  parseCsv(filePath: string): string[][] {
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const parsed = Papa.parse<string[]>(fileContent, {
      header: false, // We are parsing a grid, not a standard CSV with headers
      skipEmptyLines: false,
    });

    if (parsed.errors.length > 0) {
      console.error('CSV Parsing Errors:', parsed.errors);
      throw new Error('Failed to parse CSV');
    }

    return parsed.data;
  }
}
