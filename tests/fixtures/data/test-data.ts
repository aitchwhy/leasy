import type { Building, Tenant, Invoice, User } from '@/shared/types'

// Test user data
export const testUser: User = {
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
}

// Test buildings data
export const testBuildings: Building[] = [
  {
    id: 'building-1',
    name: '123 Main Street',
    address: '123 Main Street, New York, NY 10001',
    floors: 5,
  },
  {
    id: 'building-2',
    name: '456 Oak Avenue',
    address: '456 Oak Avenue, New York, NY 10002',
    floors: 8,
  },
]

// Test tenants data
export const testTenants: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'ABC Corporation',
    email: 'contact@abccorp.com',
    phone: '555-0123',
    unitNumber: '201',
    buildingId: 'building-1',
  },
  {
    id: 'tenant-2',
    name: 'XYZ LLC',
    email: 'info@xyzllc.com',
    phone: '555-0124',
    unitNumber: '305',
    buildingId: 'building-1',
  },
  {
    id: 'tenant-3',
    name: 'Tech Startup Inc',
    email: 'hello@techstartup.com',
    phone: '555-0125',
    unitNumber: '401',
    buildingId: 'building-2',
  },
]

// Test invoices data
export const testInvoices: Invoice[] = [
  {
    id: 'invoice-1',
    invoiceNumber: 'INV-2024-0001',
    tenantId: 'tenant-1',
    buildingId: 'building-1',
    periodStart: '2024-01-01',
    periodEnd: '2024-01-31',
    lineItems: [
      { description: 'Base Rent', amount: 5000, category: 'base_rent' },
      { description: 'Utilities', amount: 500, category: 'utilities' },
    ],
    totalAmount: 5500,
    status: 'paid',
    pdfUrl: '/api/invoices/invoice-1/pdf',
    createdAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 'invoice-2',
    invoiceNumber: 'INV-2024-0002',
    tenantId: 'tenant-2',
    buildingId: 'building-1',
    periodStart: '2024-01-01',
    periodEnd: '2024-01-31',
    lineItems: [
      { description: 'Base Rent', amount: 3500, category: 'base_rent' },
      { description: 'Maintenance', amount: 200, category: 'maintenance' },
    ],
    totalAmount: 3700,
    status: 'sent',
    createdAt: '2024-01-05T14:30:00Z',
  },
  {
    id: 'invoice-3',
    invoiceNumber: 'INV-2024-0003',
    tenantId: 'tenant-3',
    buildingId: 'building-2',
    periodStart: '2024-01-01',
    periodEnd: '2024-01-31',
    lineItems: [
      { description: 'Base Rent', amount: 2800, category: 'base_rent' },
    ],
    totalAmount: 2800,
    status: 'overdue',
    createdAt: '2024-01-10T09:15:00Z',
  },
]

// Helper to get test data by ID
export const getTestBuilding = (id: string) => 
  testBuildings.find(b => b.id === id)

export const getTestTenant = (id: string) => 
  testTenants.find(t => t.id === id)

export const getTestInvoice = (id: string) => 
  testInvoices.find(i => i.id === id)

// Dashboard metrics based on test data
export const testDashboardMetrics = {
  outstandingInvoices: testInvoices.filter(i => i.status !== 'paid').length,
  monthlyRevenue: testInvoices.reduce((sum, i) => sum + i.totalAmount, 0),
  occupancyRate: 92,
  totalTenants: testTenants.length,
}