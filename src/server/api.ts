import { Hono } from 'hono'
import { z } from 'zod'
import { store, generateId } from './db/store'
import { 
  CreateInvoiceRequestSchema, 
  LeaseQuerySchema,
  type Invoice 
} from '@/shared/types'

const app = new Hono()

// Health check endpoints
app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

app.get('/healthz', (c) => {
  return c.text('ok')
})

// FR-01: Get all buildings visible to the current owner
app.get('/buildings', (c) => {
  try {
    const buildings = store.buildings.getAll()
    return c.json(buildings)
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// FR-02: Get active leases for a building
app.get('/leases', (c) => {
  try {
    const query = c.req.query()
    const parsed = LeaseQuerySchema.safeParse(query)
    
    if (!parsed.success) {
      return c.json({ error: 'building_id is required' }, 400)
    }
    
    const { building_id } = parsed.data
    
    // Check if building exists
    const building = store.buildings.getById(building_id)
    if (!building) {
      return c.json({ error: 'Unknown building' }, 404)
    }
    
    const leases = store.leases.getByBuildingId(building_id)
    return c.json(leases)
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// FR-03: Generate an invoice for a lease
app.post('/invoices', async (c) => {
  try {
    const body = await c.req.json()
    const parsed = CreateInvoiceRequestSchema.safeParse(body)
    
    if (!parsed.success) {
      return c.json({ 
        error: 'Validation failed', 
        details: parsed.error.flatten() 
      }, 422)
    }
    
    const { lease_id, issue_date, due_date } = parsed.data
    
    // Check if lease exists
    const lease = store.leases.getById(lease_id)
    if (!lease) {
      return c.json({ error: 'Unknown lease' }, 404)
    }
    
    // Generate invoice
    const today = new Date().toISOString().split('T')[0]
    const dueIn30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]
    
    const invoice: Invoice = {
      invoice_id: generateId('inv'),
      lease_id: lease_id,
      issue_date: issue_date || today,
      due_date: due_date || dueIn30Days,
      status: 'sent',
      lines: [
        {
          description: `Monthly Rent - ${lease.tenant_name}`,
          amount: lease.rent_amount
        }
      ],
      total_amount: lease.rent_amount
    }
    
    store.invoices.create(invoice)
    
    return c.json({ invoice_id: invoice.invoice_id }, 201)
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// FR-04: Fetch single invoice
app.get('/invoices/:id', (c) => {
  try {
    const id = c.req.param('id')
    const invoice = store.invoices.getById(id)
    
    if (!invoice) {
      return c.json({ error: 'Invoice not found' }, 404)
    }
    
    return c.json(invoice)
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default app
export type AppType = typeof app