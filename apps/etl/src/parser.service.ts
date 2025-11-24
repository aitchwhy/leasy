import * as fs from 'fs';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import * as path from 'path';

export class ParserService {
  parse(filePath: string): string[][] {
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.xlsx' || ext === '.xls') {
      return this.parseExcel(filePath);
    } else if (ext === '.csv') {
      return this.parseCsv(filePath);
    } else {
      throw new Error(`Unsupported file extension: ${ext}`);
    }
  }

  private parseExcel(filePath: string): string[][] {
    const workbook = XLSX.readFile(filePath);
    console.log('Available Sheets:', workbook.SheetNames);
    
    let sheetName = workbook.SheetNames[0];
    if (workbook.SheetNames.includes('PNL임대료')) {
      sheetName = 'PNL임대료';
    }
    
    console.log(`Parsing Sheet: ${sheetName}`);
    const worksheet = workbook.Sheets[sheetName];

    // Convert to array of arrays (grid)
    // header: 1 gives us an array of arrays
    const grid = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1, defval: '' });
    return grid;
  }

  private parseCsv(filePath: string): string[][] {
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const parsed = Papa.parse<string[]>(fileContent, {
      header: false,
      skipEmptyLines: false,
    });

    if (parsed.errors.length > 0) {
      console.error('CSV Parsing Errors:', parsed.errors);
      throw new Error('Failed to parse CSV');
    }

    return parsed.data;
  }
}
