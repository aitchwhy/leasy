import { Hono } from 'hono';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@leasy/db';

import { authMiddleware, requireAuth } from './middleware/auth';
import { Bindings, getDb } from './lib/db';

const app = new Hono<{ Bindings: Bindings }>();

// Public routes
app.get('/health', (c) => {
  return c.json({ status: 'ok', env: c.env.NODE_ENV });
});

import tenantsApp from './routes/tenants';
import leasesApp from './routes/leases';
import utilitiesApp from './routes/utilities';
import invoicesApp from './routes/invoices';
import unitsApp from './routes/units';

// Protected routes
app.use('/api/*', authMiddleware);

app.route('/api/tenants', tenantsApp);
app.route('/api/leases', leasesApp);
app.route('/api/utilities', utilitiesApp);
app.route('/api/invoices', invoicesApp);
app.route('/api/units', unitsApp);

app.get('/db-check', requireAuth, async (c) => {
  const db = getDb(c);
  try {
    const result = await db.select().from(schema.buildings).limit(1);
    return c.json({ status: 'connected', result });
  } catch (e) {
    return c.json({ status: 'error', error: String(e) }, 500);
  }
});

export default app;
