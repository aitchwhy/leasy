import { Hono } from 'hono';
import { env } from '@leasy/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@leasy/db';

import { authMiddleware, requireAuth } from './middleware/auth';

const app = new Hono();

// Public routes
app.get('/health', (c) => {
  return c.json({ status: 'ok', env: env.NODE_ENV });
});

import tenantsApp from './routes/tenants';
import leasesApp from './routes/leases';
import utilitiesApp from './routes/utilities';
import invoicesApp from './routes/invoices';

// Protected routes
app.use('/api/*', authMiddleware);

app.route('/api/tenants', tenantsApp);
app.route('/api/leases', leasesApp);
app.route('/api/utilities', utilitiesApp);
app.route('/api/invoices', invoicesApp);

app.get('/db-check', requireAuth, async (c) => {
  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql, { schema });
  try {
    const result = await db.select().from(schema.buildings).limit(1);
    return c.json({ status: 'connected', result });
  } catch (e) {
    return c.json({ status: 'error', error: String(e) }, 500);
  }
});

export default app;
