import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createBuildingSchema } from '@/shared/schemas'
import { db } from '../db/store'
import { requireAuth } from '../middleware/auth'

const app = new Hono()

// Get all buildings
app.get('/', requireAuth, (c) => {
  const buildings = db.getAllBuildings()
  return c.json(buildings)
})

// Get building by ID
app.get('/:id', requireAuth, (c) => {
  const id = c.req.param('id')
  const building = db.getBuildingById(id)
  
  if (!building) {
    return c.json({ error: 'Building not found' }, 404)
  }
  
  return c.json(building)
})

// Create new building
app.post('/', requireAuth, zValidator('json', createBuildingSchema), (c) => {
  const data = c.req.valid('json')
  const building = db.createBuilding(data)
  return c.json(building, 201)
})

export default app