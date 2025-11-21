import { z } from 'zod';

export const createTenantSchema = z.object({
  name: z.string().min(1),
  businessRegistrationId: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
});

export const updateTenantSchema = createTenantSchema.partial();

export const createLeaseSchema = z.object({
  unitId: z.number().int().positive(),
  tenantId: z.number().int().positive(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  baseRentKrw: z.string().regex(/^\d+(\.\d+)?$/), // Decimal string
  managementFeeKrw: z.string().regex(/^\d+(\.\d+)?$/).default("0"),
  depositKrw: z.string().regex(/^\d+(\.\d+)?$/),
  isActive: z.boolean().default(true),
});

export const updateLeaseSchema = createLeaseSchema.partial();

export const utilityReadingSchema = z.object({
  meterId: z.number().int().positive(),
  readingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  value: z.number().int().nonnegative(),
});

export const bulkUtilityReadingSchema = z.array(utilityReadingSchema);
