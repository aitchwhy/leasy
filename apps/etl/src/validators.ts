import { z } from 'zod';

// Validator for SBNC Budget.xlsx (Rent Roll)
export const TenantExcelSchema = z.object({
  unit_number: z.string().or(z.number()).transform(v => String(v)),
  tenant_name: z.string(),
  start_date: z.date().or(z.string()), // Excel date or string
  end_date: z.date().or(z.string()).optional(),
  base_rent: z.number().or(z.string()),
  management_fee: z.number().or(z.string()).default(0),
  deposit: z.number().or(z.string()),
});

// Validator for leasy-example-invoice-data-sbnc-budget-1.xlsx (Readings)
export const UtilityReadingExcelSchema = z.object({
  unit_number: z.string().or(z.number()).transform(v => String(v)),
  electricity_reading: z.number().or(z.string()),
  water_reading: z.number().or(z.string()),
  reading_date: z.date().or(z.string()).optional(), // Might need to infer if missing
});

export type TenantExcelRow = z.infer<typeof TenantExcelSchema>;
export type UtilityReadingExcelRow = z.infer<typeof UtilityReadingExcelSchema>;
