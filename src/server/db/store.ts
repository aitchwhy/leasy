import type { Building, Tenant, Invoice } from '@/shared/types'

// In-memory data store
class InMemoryStore {
  private buildings: Map<string, Building> = new Map()
  private tenants: Map<string, Tenant> = new Map()
  private invoices: Map<string, Invoice> = new Map()
  private counters = {
    building: 1,
    tenant: 1,
    invoice: 1,
  }

  constructor() {
    // Seed with sample data
    this.seedData()
  }

  private seedData() {
    // Sample buildings
    const building1: Building = {
      id: 'b1',
      name: '123 Main Street',
      address: '123 Main Street, New York, NY 10001',
      floors: 5,
    }
    const building2: Building = {
      id: 'b2',
      name: '456 Oak Avenue',
      address: '456 Oak Avenue, New York, NY 10002',
      floors: 8,
    }
    this.buildings.set(building1.id, building1)
    this.buildings.set(building2.id, building2)

    // Sample tenants
    const tenant1: Tenant = {
      id: 't1',
      name: 'ABC Corp',
      email: 'contact@abccorp.com',
      phone: '555-0123',
      unitNumber: '201',
      buildingId: 'b1',
    }
    const tenant2: Tenant = {
      id: 't2',
      name: 'XYZ LLC',
      email: 'info@xyzllc.com',
      phone: '555-0124',
      unitNumber: '305',
      buildingId: 'b1',
    }
    this.tenants.set(tenant1.id, tenant1)
    this.tenants.set(tenant2.id, tenant2)
  }

  // Building methods
  getAllBuildings(): Building[] {
    return Array.from(this.buildings.values())
  }

  getBuildingById(id: string): Building | undefined {
    return this.buildings.get(id)
  }

  createBuilding(data: Omit<Building, 'id'>): Building {
    const building: Building = {
      ...data,
      id: `b${this.counters.building++}`,
    }
    this.buildings.set(building.id, building)
    return building
  }

  // Tenant methods
  getAllTenants(): Tenant[] {
    return Array.from(this.tenants.values())
  }

  getTenantById(id: string): Tenant | undefined {
    return this.tenants.get(id)
  }

  getTenantsByBuilding(buildingId: string): Tenant[] {
    return Array.from(this.tenants.values()).filter(t => t.buildingId === buildingId)
  }

  createTenant(data: Omit<Tenant, 'id'>): Tenant {
    const tenant: Tenant = {
      ...data,
      id: `t${this.counters.tenant++}`,
    }
    this.tenants.set(tenant.id, tenant)
    return tenant
  }

  // Invoice methods
  getAllInvoices(): Invoice[] {
    return Array.from(this.invoices.values())
  }

  getInvoiceById(id: string): Invoice | undefined {
    return this.invoices.get(id)
  }

  createInvoice(data: Omit<Invoice, 'id' | 'invoiceNumber' | 'totalAmount' | 'createdAt'>): Invoice {
    const totalAmount = data.lineItems.reduce((sum, item) => sum + item.amount, 0)
    const invoice: Invoice = {
      ...data,
      id: `inv${this.counters.invoice++}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(this.counters.invoice).padStart(4, '0')}`,
      totalAmount,
      createdAt: new Date().toISOString(),
    }
    this.invoices.set(invoice.id, invoice)
    return invoice
  }

  updateInvoice(id: string, data: Partial<Invoice>): Invoice | undefined {
    const invoice = this.invoices.get(id)
    if (!invoice) return undefined

    const updated = { ...invoice, ...data }
    if (data.lineItems) {
      updated.totalAmount = data.lineItems.reduce((sum, item) => sum + item.amount, 0)
    }
    this.invoices.set(id, updated)
    return updated
  }
}

// Export singleton instance
export const db = new InMemoryStore()