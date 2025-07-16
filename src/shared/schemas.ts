import { z } from 'zod'

// Building schema
export const buildingSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Building name is required'),
  address: z.string().min(1, 'Address is required'),
  floors: z.number().int().positive('Number of floors must be positive'),
})

// Tenant schema
export const tenantSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Tenant name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  unitNumber: z.string().min(1, 'Unit number is required'),
  buildingId: z.string(),
})

// Line item schema
export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  category: z.enum(['base_rent', 'utilities', 'maintenance', 'other']),
})

// Invoice schema
export const invoiceSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string(),
  tenantId: z.string(),
  buildingId: z.string(),
  periodStart: z.string(), // ISO date string
  periodEnd: z.string(), // ISO date string
  lineItems: z.array(lineItemSchema),
  totalAmount: z.number(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue']),
  pdfUrl: z.string().optional(),
  createdAt: z.string(), // ISO date string
})

// Input schemas for API endpoints
export const createBuildingSchema = buildingSchema.omit({ id: true })
export const createTenantSchema = tenantSchema.omit({ id: true })
export const createInvoiceSchema = invoiceSchema.omit({ 
  id: true, 
  invoiceNumber: true, 
  totalAmount: true, 
  createdAt: true,
  pdfUrl: true,
})