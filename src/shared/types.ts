import { z } from 'zod'

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