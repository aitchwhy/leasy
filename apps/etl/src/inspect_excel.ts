
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const files = [
  'leasy-example-invoice-data-sbnc-budget-1.xlsx',
  'SBNC Budget.xlsx'
];

const dataDir = path.join(process.cwd(), 'docs');

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  console.log(`\n--- Inspecting ${file} ---`);
  const workbook = XLSX.readFile(filePath);
  console.log('Sheets:', workbook.SheetNames);

  workbook.SheetNames.forEach(sheetName => {
    console.log(`\nSheet: ${sheetName}`);
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (data.length > 0) {
      console.log('Header Row:', data[0]);
      console.log('First Data Row:', data[1]);
    } else {
      console.log('Empty sheet');
    }
  });
});
