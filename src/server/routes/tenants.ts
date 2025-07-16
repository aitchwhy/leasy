import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { createTenantSchema } from '@/shared/schemas'
import { db } from '../db/store'
import { requireAuth } from '../middleware/auth'

const app = new Hono()

// Get all tenants
app.get('/', requireAuth, (c) => {
  const buildingId = c.req.query('buildingId')
  
  if (buildingId) {
    const tenants = db.getTenantsByBuilding(buildingId)
    return c.json(tenants)
  }
  
  const tenants = db.getAllTenants()
  return c.json(tenants)
})

// Get tenant by ID
app.get('/:id', requireAuth, (c) => {
  const id = c.req.param('id')
  const tenant = db.getTenantById(id)
  
  if (!tenant) {
    return c.json({ error: 'Tenant not found' }, 404)
  }
  
  return c.json(tenant)
})

// Create new tenant
app.post('/', requireAuth, zValidator('json', createTenantSchema), (c) => {
  const data = c.req.valid('json')
  
  // Verify building exists
  const building = db.getBuildingById(data.buildingId)
  if (!building) {
    return c.json({ error: 'Building not found' }, 400)
  }
  
  const tenant = db.createTenant(data)
  return c.json(tenant, 201)
})

export default app