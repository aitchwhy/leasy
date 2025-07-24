import { Context, Hono } from 'hono'
import { pnlTenantData } from '../db/pnl-data'
import { requireAuth } from './auth'

const app = new Hono()

// Apply authentication middleware
app.use('*', requireAuth as any)

// Get all tenants for the PNL building
app.get('/', (c: Context) => {
  try {
    const user = c.get('user') as { name: string; role: string }

    // For MVP, only Il Keun Lee can access
    if (user.name !== 'Il Keun Lee') {
      return c.json({ error: 'Unauthorized' }, 403)
    }

    // Return tenant data
    return c.json(pnlTenantData)
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default app
