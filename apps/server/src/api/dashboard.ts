import { Hono } from 'hono'
import { requireAuth } from '../middleware/auth'

const dashboard = new Hono()

// Apply auth middleware to all dashboard routes
dashboard.use('/*', requireAuth)

dashboard.get('/', async (c) => {
  const user = c.get('user')
  
  // Mock data for PNL building
  const dashboardData = {
    building: {
      id: '1',
      name: 'PNL',
      address: '경기도 부천시 원미구 부일로 223번길 9',
      owner: user.name,
      totalUnits: 12,
      occupiedUnits: 12,
      occupancyRate: 100
    },
    metrics: {
      monthlyRevenue: 27333581,
      monthlyExpenses: 5000000,
      netIncome: 22333581,
      currency: 'KRW'
    },
    recentActivity: [
      {
        id: '1',
        type: 'payment',
        description: 'Rent payment received - Unit 301',
        date: new Date().toISOString(),
        amount: 2500000
      }
    ]
  }
  
  return c.json(dashboardData)
})

export { dashboard }