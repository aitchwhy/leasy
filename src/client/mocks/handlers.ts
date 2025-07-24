import { pnlTenantData } from '@/server/db/pnl-data';
import type {
    DashboardResponse,
    GenerateInvoicesRequest,
    GenerateInvoicesResponse,
    MockLoginRequest,
    MockLoginResponse
} from '@/shared/types';
import { http, HttpResponse } from 'msw';

// Mock session storage
const sessions = new Map<string, { user: { name: string; role: string } }>()

// Generate mock token
function generateToken(): string {
  return `mock-token-${Date.now()}-${Math.random().toString(36).substring(2)}`
}

export const handlers = [
  // Mock login
  http.post('/api/auth/mock-login', async ({ request }) => {
    const body = await request.json() as MockLoginRequest

    if (!body.name || body.name.trim() === '') {
      return HttpResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (body.name !== 'Il Keun Lee') {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const token = generateToken()
    const user = { name: body.name, role: 'owner' }
    sessions.set(token, { user })

    const response: MockLoginResponse = {
      token,
      user
    }

    return HttpResponse.json(response)
  }),

  // Logout
  http.post('/api/auth/logout', async ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      sessions.delete(token)
    }

    return HttpResponse.json({ message: 'Logged out successfully' })
  }),

  // Dashboard
  http.get('/api/dashboard', async ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const session = sessions.get(token)

    if (!session) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const totalMonthlyRevenue = pnlTenantData.reduce((sum, tenant) =>
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
        lastInvoiceGeneration: undefined
      }
    }

    return HttpResponse.json(response)
  }),

  // Get tenants
  http.get('/api/tenants', async ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return HttpResponse.json(pnlTenantData)
  }),

  // Generate invoices
  http.post('/api/invoices/generate', async ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json() as GenerateInvoicesRequest

    const invoices = body.tenantIds.map(tenantId => {
      const tenant = pnlTenantData.find(t => t.id === tenantId)
      if (!tenant) {
        throw new Error(`Tenant ${tenantId} not found`)
      }

      return {
        id: `inv-${Date.now()}-${Math.random().toString(36).substring(2)}`,
        tenantName: tenant.name,
        amount: tenant.totalAmount
      }
    })

    const response: GenerateInvoicesResponse = {
      invoices,
      count: invoices.length
    }

    return HttpResponse.json(response)
  }),

  // Get invoice PDF (mock)
  http.get('/api/invoices/:id/pdf', async ({ request, params }) => {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // For MVP, return a mock PDF response
    return new HttpResponse(
      new Blob(['Mock PDF content'], { type: 'application/pdf' }),
      {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="invoice-${params.id}.pdf"`
        }
      }
    )
  })
]
