import type { Building, Lease, Invoice } from '@/shared/types'

// In-memory storage - cleared on redeploy
const buildings: Building[] = [
  {
    building_id: 'bld-001',
    name: 'Main Plaza',
    address: '123 Main Street, Downtown City, DC 10001'
  },
  {
    building_id: 'bld-002',
    name: 'Tech Center',
    address: '456 Innovation Drive, Tech Park, TC 20002'
  },
  {
    building_id: 'bld-003',
    name: 'West Tower',
    address: '789 West Avenue, Business District, WD 30003'
  }
]

const leases: Lease[] = [
  {
    lease_id: 'lease-001',
    building_id: 'bld-001',
    tenant_name: 'ABC Corp',
    rent_amount: 5000,
    start_date: '2024-01-01',
    end_date: '2024-12-31'
  },
  {
    lease_id: 'lease-002',
    building_id: 'bld-001',
    tenant_name: 'XYZ LLC',
    rent_amount: 3500,
    start_date: '2024-01-01',
    end_date: '2024-12-31'
  },
  {
    lease_id: 'lease-003',
    building_id: 'bld-002',
    tenant_name: 'Tech Startup Inc',
    rent_amount: 2800,
    start_date: '2024-01-01',
    end_date: '2024-12-31'
  },
  {
    lease_id: 'lease-004',
    building_id: 'bld-002',
    tenant_name: 'Innovation Labs',
    rent_amount: 4200,
    start_date: '2024-01-01',
    end_date: '2024-12-31'
  },
  {
    lease_id: 'lease-005',
    building_id: 'bld-003',
    tenant_name: 'Finance Solutions',
    rent_amount: 6500,
    start_date: '2024-01-01',
    end_date: '2024-12-31'
  }
]

const invoices: Invoice[] = [
  {
    invoice_id: 'inv-001',
    lease_id: 'lease-001',
    issue_date: '2024-01-01',
    due_date: '2024-01-15',
    status: 'paid',
    lines: [
      { description: 'Monthly Rent - January 2024', amount: 5000 }
    ],
    total_amount: 5000
  },
  {
    invoice_id: 'inv-002',
    lease_id: 'lease-002',
    issue_date: '2024-01-01',
    due_date: '2024-01-14',
    status: 'sent',
    lines: [
      { description: 'Monthly Rent - January 2024', amount: 3500 }
    ],
    total_amount: 3500
  },
  {
    invoice_id: 'inv-003',
    lease_id: 'lease-003',
    issue_date: '2024-01-01',
    due_date: '2024-01-10',
    status: 'overdue',
    lines: [
      { description: 'Monthly Rent - January 2024', amount: 2800 }
    ],
    total_amount: 2800
  }
]

// CRUD operations
export const store = {
  buildings: {
    getAll: () => [...buildings],
    getById: (id: string) => buildings.find(b => b.building_id === id)
  },
  
  leases: {
    getAll: () => [...leases],
    getByBuildingId: (buildingId: string) => 
      leases.filter(l => l.building_id === buildingId),
    getById: (id: string) => leases.find(l => l.lease_id === id)
  },
  
  invoices: {
    getAll: () => [...invoices],
    getById: (id: string) => invoices.find(i => i.invoice_id === id),
    create: (invoice: Invoice) => {
      invoices.push(invoice)
      return invoice
    }
  }
}

// Helper to generate unique IDs
export function generateId(prefix: string): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `${prefix}-${timestamp}-${random}`
}