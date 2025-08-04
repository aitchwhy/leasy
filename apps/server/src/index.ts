import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './api/auth'
import { dashboard } from './api/dashboard'

const app = new Hono()

// Enable CORS for development
app.use('/*', cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

// Health check
app.get('/', (c) => {
  return c.json({ status: 'ok', service: 'leasy-api' })
})

// Mount API routes
app.route('/api/auth', auth)
app.route('/api/dashboard', dashboard)

export default app
