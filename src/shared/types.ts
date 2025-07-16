import { z } from 'zod'
import {
  buildingSchema,
  tenantSchema,
  invoiceSchema,
  lineItemSchema,
  createBuildingSchema,
  createTenantSchema,
  createInvoiceSchema,
} from './schemas'

// Type exports
export type Building = z.infer<typeof buildingSchema>
export type Tenant = z.infer<typeof tenantSchema>
export type Invoice = z.infer<typeof invoiceSchema>
export type LineItem = z.infer<typeof lineItemSchema>

export type CreateBuildingInput = z.infer<typeof createBuildingSchema>
export type CreateTenantInput = z.infer<typeof createTenantSchema>
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>

// User type for authentication
export type User = {
  id: string
  email: string
  name: string
  picture?: string
}