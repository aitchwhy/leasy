import { Hono } from 'hono'
import buildings from './routes/buildings'
import tenants from './routes/tenants'
import invoices from './routes/invoices'

const app = new Hono()

// Mount routes
const routes = app
  .route('/buildings', buildings)
  .route('/tenants', tenants)
  .route('/invoices', invoices)

export default routes
export type AppType = typeof routes
