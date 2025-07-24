import { z } from 'zod'

// ===== EXISTING TYPES (keep for compatibility) =====

// Building schema and type
export const BuildingSchema = z.object({
  building_id: z.string(),
  name: z.string(),
  address: z.string(),
})

export type Building = z.infer<typeof BuildingSchema>

// Lease schema and type
export const LeaseSchema = z.object({
  lease_id: z.string(),
  building_id: z.string(),
  tenant_name: z.string(),
  rent_amount: z.number(),
  start_date: z.string(),
  end_date: z.string(),
})

export type Lease = z.infer<typeof LeaseSchema>

// Invoice line item schema
export const InvoiceLineSchema = z.object({
  description: z.string(),
  amount: z.number(),
})

// Invoice schema and type
export const InvoiceSchema = z.object({
  invoice_id: z.string(),
  lease_id: z.string(),
  issue_date: z.string(),
  due_date: z.string(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']),
  lines: z.array(InvoiceLineSchema),
  total_amount: z.number(),
})

export type Invoice = z.infer<typeof InvoiceSchema>

// API request schemas
export const CreateInvoiceRequestSchema = z.object({
  lease_id: z.string(),
  issue_date: z.string().optional(),
  due_date: z.string().optional(),
})

export type CreateInvoiceRequest = z.infer<typeof CreateInvoiceRequestSchema>

// API response schemas
export const CreateInvoiceResponseSchema = z.object({
  invoice_id: z.string(),
})

export type CreateInvoiceResponse = z.infer<typeof CreateInvoiceResponseSchema>

// Query parameter schemas
export const LeaseQuerySchema = z.object({
  building_id: z.string(),
})

export type LeaseQuery = z.infer<typeof LeaseQuerySchema>

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
})

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

// ===== NEW MVP TYPES =====

// Mock authentication schemas
export const MockLoginRequestSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

export type MockLoginRequest = z.infer<typeof MockLoginRequestSchema>

export const MockLoginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    name: z.string(),
    role: z.string(),
  }),
})

export type MockLoginResponse = z.infer<typeof MockLoginResponseSchema>

// Tenant info (embedded in invoice, not separate entity)
export const TenantInfoSchema = z.object({
  name: z.string(),
  unit: z.string(),
  businessNumber: z.string().optional(),
})

export type TenantInfo = z.infer<typeof TenantInfoSchema>

// Enhanced Building schema for MVP
export const BuildingDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  owner: z.string(),
  totalUnits: z.number(),
  occupiedUnits: z.number(),
  monthlyRevenue: z.number(),
})

export type BuildingDetail = z.infer<typeof BuildingDetailSchema>

// Dashboard response schema
export const DashboardResponseSchema = z.object({
  building: BuildingDetailSchema,
  summary: z.object({
    totalTenants: z.number(),
    totalMonthlyRevenue: z.number(),
    lastInvoiceGeneration: z.string().optional(),
  }),
})

export type DashboardResponse = z.infer<typeof DashboardResponseSchema>

// Tenant with billing info
export const TenantBillingSchema = z.object({
  id: z.string(),
  unit: z.string(),
  name: z.string(),
  businessNumber: z.string().optional(),
  monthlyRent: z.number(),
  electricityCharge: z.number(),
  waterCharge: z.number(),
  vat: z.number(),
  totalAmount: z.number(),
})

export type TenantBilling = z.infer<typeof TenantBillingSchema>

// Invoice generation request
export const GenerateInvoicesRequestSchema = z.object({
  period: z.string(), // e.g., "2025년 5월"
  tenantIds: z.array(z.string()).min(1, 'At least one tenant must be selected'),
})

export type GenerateInvoicesRequest = z.infer<typeof GenerateInvoicesRequestSchema>

// Enhanced invoice item schema
export const InvoiceItemSchema = z.object({
  description: z.string(),
  amount: z.number(),
  vat: z.number(),
})

export type InvoiceItem = z.infer<typeof InvoiceItemSchema>

// Full invoice schema for MVP
export const FullInvoiceSchema = z.object({
  id: z.string(),
  buildingId: z.string(),
  tenant: TenantInfoSchema,
  period: z.string(),
  items: z.array(InvoiceItemSchema),
  subtotal: z.number(),
  totalVat: z.number(),
  grandTotal: z.number(),
  issueDate: z.string(),
  dueDate: z.string(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']),
})

export type FullInvoice = z.infer<typeof FullInvoiceSchema>

// Invoice generation response
export const GenerateInvoicesResponseSchema = z.object({
  invoices: z.array(z.object({
    id: z.string(),
    tenantName: z.string(),
    amount: z.number(),
  })),
  count: z.number(),
})

export type GenerateInvoicesResponse = z.infer<typeof GenerateInvoicesResponseSchema>
