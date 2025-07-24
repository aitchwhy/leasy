import type { DashboardResponse } from '@/shared/types'
import { Context, Hono } from 'hono'
import { pnlTenantData } from '../db/pnl-data'
import { requireAuth } from './auth'

const app = new Hono()

// Apply authentication middleware
app.use('*', requireAuth as any)

// Dashboard endpoint - returns PNL building data for Il Keun Lee
app.get('/', (c: Context) => {
  try {
    const user = c.get('user') as { name: string; role: string }

    // For MVP, only Il Keun Lee can access
    if (user.name !== 'Il Keun Lee') {
      return c.json({ error: 'Unauthorized' }, 403)
    }

        // Calculate totals from tenant data
    const totalMonthlyRevenue = pnlTenantData.reduce((sum: number, tenant: any) =>
      sum + tenant.monthlyRent + tenant.vat, 0
    )

    const response: DashboardResponse = {
      building: {
        id: 'pnl-001',
        name: 'PNL Building',
        address: '서울특별시 강남구 논현로 159길 17',
        owner: 'Il Keun Lee',
        totalUnits: 13,
        occupiedUnits: pnlTenantData.length,
        monthlyRevenue: totalMonthlyRevenue
      },
      summary: {
        totalTenants: pnlTenantData.length,
        totalMonthlyRevenue: totalMonthlyRevenue,
        lastInvoiceGeneration: undefined // No invoices generated yet in MVP
      }
    }

    return c.json(response)
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default app
