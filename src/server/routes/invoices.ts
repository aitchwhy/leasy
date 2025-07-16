import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { createInvoiceSchema } from '@/shared/schemas'
import { db } from '../db/store'
import { requireAuth } from '../middleware/auth'
// import { generateInvoicePDF } from '../services/pdf-generator'

const app = new Hono()

// Get all invoices
app.get('/', requireAuth, (c) => {
  const invoices = db.getAllInvoices()
  return c.json(invoices)
})

// Get invoice by ID
app.get('/:id', requireAuth, (c) => {
  const id = c.req.param('id')
  const invoice = db.getInvoiceById(id)
  
  if (!invoice) {
    return c.json({ error: 'Invoice not found' }, 404)
  }
  
  return c.json(invoice)
})

// Create new invoice
app.post('/', requireAuth, zValidator('json', createInvoiceSchema), (c) => {
  const data = c.req.valid('json')
  
  // Verify tenant and building exist
  const tenant = db.getTenantById(data.tenantId)
  if (!tenant) {
    return c.json({ error: 'Tenant not found' }, 400)
  }
  
  const building = db.getBuildingById(data.buildingId)
  if (!building) {
    return c.json({ error: 'Building not found' }, 400)
  }
  
  const invoice = db.createInvoice(data)
  return c.json(invoice, 201)
})

// Generate PDF for invoice
app.post('/:id/generate-pdf', requireAuth, async (c) => {
  const id = c.req.param('id')
  const invoice = db.getInvoiceById(id)
  
  if (!invoice) {
    return c.json({ error: 'Invoice not found' }, 404)
  }
  
  // Temporarily disabled PDF generation for Cloudflare Workers compatibility
  const pdfUrl = `/api/invoices/${id}/pdf`
  const updated = db.updateInvoice(id, { pdfUrl })
  
  return c.json({ 
    message: 'PDF generation placeholder',
    pdfUrl,
    invoice: updated 
  })
})

// Get invoice PDF
app.get('/:id/pdf', requireAuth, async (c) => {
  const id = c.req.param('id')
  const invoice = db.getInvoiceById(id)
  
  if (!invoice || !invoice.pdfUrl) {
    return c.json({ error: 'Invoice PDF not found' }, 404)
  }
  
  // Temporarily return placeholder for PDF
  return c.text(`Invoice PDF for ${invoice.invoiceNumber} would be here`, 200, {
    'Content-Type': 'text/plain',
  })
})

export default app