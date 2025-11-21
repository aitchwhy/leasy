import { z } from 'zod';

// Validator for PNL임차인.csv (Tenant & Lease Info)
// Assumed columns based on typical data. Will need adjustment if actual CSV differs.
export const TenantCsvSchema = z.object({
  unit_number: z.string(), // 호수
  tenant_name: z.string(), // 상호
  owner_name: z.string().optional(), // 대표자 (might be same as tenant_name or separate)
  business_id: z.string().optional(), // 사업자번호
  contact_phone: z.string().optional(), // 연락처
  start_date: z.string(), // 계약시작일 (YYYY-MM-DD or similar)
  end_date: z.string().optional(), // 계약종료일
  deposit: z.string(), // 보증금 (Numeric string)
  rent: z.string(), // 임대료 (Numeric string)
  management_fee: z.string().optional(), // 관리비
  area: z.string().optional(), // 면적 (pyung or sqm)
});

// Validator for PNL임대료.csv (Rent Roll / Area Info)
// Might contain building info or more specific rent details
export const RentRollCsvSchema = z.object({
  unit_number: z.string(),
  tenant_name: z.string(),
  rent_amount: z.string(),
  vat_amount: z.string().optional(),
});

export type TenantCsvRow = z.infer<typeof TenantCsvSchema>;
export type RentRollCsvRow = z.infer<typeof RentRollCsvSchema>;
