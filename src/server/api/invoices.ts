import { GenerateInvoicesRequestSchema, type FullInvoice, type GenerateInvoicesResponse } from '@/shared/types'
import { Context, Hono } from 'hono'
import { pnlTenantData } from '../db/pnl-data'
import { requireAuth } from './auth'

const app = new Hono()

// Apply authentication middleware
app.use('*', requireAuth as any)

// In-memory invoice storage
const invoices = new Map<string, FullInvoice>()

// Generate unique invoice ID
function generateInvoiceId(): string {
  return `inv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
}

// Generate invoices
app.post('/generate', async (c: Context) => {
  try {
    const user = c.get('user') as { name: string; role: string }

    // For MVP, only Il Keun Lee can access
    if (user.name !== 'Il Keun Lee') {
      return c.json({ error: 'Unauthorized' }, 403)
    }

    const body = await c.req.json()
    const parsed = GenerateInvoicesRequestSchema.safeParse(body)

    if (!parsed.success) {
      return c.json({
        error: 'Validation failed',
        details: parsed.error.flatten()
      }, 422)
    }

    const { period, tenantIds } = parsed.data
    const generatedInvoices: Array<{ id: string; tenantName: string; amount: number }> = []

    // Generate invoice for each selected tenant
    for (const tenantId of tenantIds) {
      const tenant = pnlTenantData.find(t => t.id === tenantId)
      if (!tenant) {
        continue // Skip if tenant not found
      }

      const invoiceId = generateInvoiceId()
      const today = new Date().toISOString().split('T')[0]
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const invoice: FullInvoice = {
        id: invoiceId,
        buildingId: 'pnl-001',
        tenant: {
          name: tenant.name,
          unit: tenant.unit,
          businessNumber: tenant.businessNumber
        },
        period: period,
        items: [
          {
            description: `임대료 (Rent) - ${period}`,
            amount: tenant.monthlyRent,
            vat: tenant.vat
          },
          {
            description: '전기요금 (Electricity)',
            amount: tenant.electricityCharge,
            vat: Math.round(tenant.electricityCharge * 0.1)
          },
          {
            description: '수도요금 (Water)',
            amount: tenant.waterCharge,
            vat: Math.round(tenant.waterCharge * 0.1)
          }
        ],
        subtotal: tenant.monthlyRent + tenant.electricityCharge + tenant.waterCharge,
        totalVat: tenant.vat + Math.round(tenant.electricityCharge * 0.1) + Math.round(tenant.waterCharge * 0.1),
        grandTotal: tenant.totalAmount,
        issueDate: today,
        dueDate: dueDate,
        status: 'sent'
      }

      invoices.set(invoiceId, invoice)
      generatedInvoices.push({
        id: invoiceId,
        tenantName: tenant.name,
        amount: tenant.totalAmount
      })
    }

    const response: GenerateInvoicesResponse = {
      invoices: generatedInvoices,
      count: generatedInvoices.length
    }

    return c.json(response, 201)
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get invoice PDF (mock implementation)
app.get('/:id/pdf', (c: Context) => {
  try {
    const user = c.get('user') as { name: string; role: string }

    if (user.name !== 'Il Keun Lee') {
      return c.json({ error: 'Unauthorized' }, 403)
    }

    const id = c.req.param('id')
    const invoice = invoices.get(id)

    if (!invoice) {
      return c.json({ error: 'Invoice not found' }, 404)
    }

    // For MVP, return a mock PDF response
    const mockPdfContent = `
      INVOICE
      ========
      Invoice ID: ${invoice.id}
      Period: ${invoice.period}

      Tenant: ${invoice.tenant.name}
      Unit: ${invoice.tenant.unit}

      Items:
      ${invoice.items.map(item => `- ${item.description}: ₩${item.amount.toLocaleString()}`).join('\n      ')}

      Total: ₩${invoice.grandTotal.toLocaleString()}
    `

    return new Response(
      new Blob([mockPdfContent], { type: 'application/pdf' }),
      {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`
        }
      }
    )
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default app
