import { z } from 'zod';

export const BuildingSchema = z.object({
  name: z.string(),
  address: z.string(),
  electricityCustomerId: z.string().optional(),
  waterCustomerId: z.string().optional(),
});

export const UnitSchema = z.object({
  unitNumber: z.string(),
  areaSqm: z.string().transform((val) => val.replace(/[^0-9.]/g, '')), // Clean string to decimal-ready string
});

export const TenantSchema = z.object({
  name: z.string(),
  businessRegistrationId: z.string().optional(), // Might be missing or malformed
});

export const LeaseSchema = z.object({
  baseRentKrw: z.string().transform((val) => val.replace(/[^0-9]/g, '')), // Clean to integer string
  startDate: z.string().optional(), // YYYY-MM-DD
  depositKrw: z.string().default('0'),
});

export const ExtractedDataSchema = z.object({
  building: BuildingSchema,
  unit: UnitSchema,
  tenant: TenantSchema,
  lease: LeaseSchema,
});

export type ExtractedData = z.infer<typeof ExtractedDataSchema>;
