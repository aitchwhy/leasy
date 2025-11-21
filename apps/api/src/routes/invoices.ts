import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { invoices, invoiceLineItems, leases, tenants, units } from '@leasy/db';
import { eq, and, lte, gte } from 'drizzle-orm';
import { env } from '@leasy/config';
import { InvoiceCalculator } from '@leasy/domain';
import { Decimal } from 'decimal.js';

const app = new Hono();

const generateInvoiceSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

app.post('/generate', zValidator('json', generateInvoiceSchema), async (c) => {
  const { year, month, dueDate } = c.req.valid('json');
  const sql = neon(env.DATABASE_URL);
  const db = drizzle(sql);

  // Define billing period
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of month
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  // Fetch active leases overlapping with the period
  // Simplified: Active if start <= end of month AND (end is null OR end >= start of month)
  // And isActive is true
  const activeLeases = await db.select().from(leases).where(
      and(
          eq(leases.isActive, true),
          lte(leases.startDate, endDateStr)
          // TODO: Handle lease end date check properly (drizzle OR condition)
      )
  );

  const generatedInvoices = [];

  for (const lease of activeLeases) {
      // Skip if lease ends before period start
      if (lease.endDate && lease.endDate < startDateStr) continue;

      // 1. Calculate Rent
      const baseRent = new Decimal(lease.baseRentKrw);
      const rentVat = InvoiceCalculator.calculateRentVat(baseRent);
      const rentTotal = baseRent.add(rentVat);

      // 2. Calculate Mgmt Fee
      const mgmtFee = new Decimal(lease.managementFeeKrw);
      const mgmtFeeVat = InvoiceCalculator.calculateManagementFeeVat(mgmtFee);
      const mgmtFeeTotal = mgmtFee.add(mgmtFeeVat);

      // 3. Create Invoice Record
      const totalAmount = rentTotal.add(mgmtFeeTotal); // + Utilities later

      const [invoice] = await db.insert(invoices).values({
          leaseId: lease.id,
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: dueDate,
          totalAmountKrw: totalAmount.toString(),
          status: 'DRAFT',
          billingPeriod: `${year}-${String(month).padStart(2, '0')}`,
      }).returning();

      // 4. Create Line Items
      // Rent
      await db.insert(invoiceLineItems).values({
          invoiceId: invoice.id,
          type: 'RENT',
          description: `${month}월 임대료`,
          amountKrw: baseRent.toString(),
          vatKrw: rentVat.toString(),
      });

      // Mgmt Fee
      if (!mgmtFee.isZero()) {
          await db.insert(invoiceLineItems).values({
              invoiceId: invoice.id,
              type: 'MANAGEMENT_FEE',
              description: `${month}월 관리비`,
              amountKrw: mgmtFee.toString(),
              vatKrw: mgmtFeeVat.toString(),
          });
      }

      generatedInvoices.push(invoice);
  }

  return c.json({ count: generatedInvoices.length, invoices: generatedInvoices }, 201);
});

app.get('/', async (c) => {
    const sql = neon(env.DATABASE_URL);
    const db = drizzle(sql);
    const result = await db.select().from(invoices);
    return c.json(result);
});

const updateStatusSchema = z.object({
    status: z.enum(['DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'VOID']),
});

app.put('/:id/status', zValidator('json', updateStatusSchema), async (c) => {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

    const { status } = c.req.valid('json');
    const sql = neon(env.DATABASE_URL);
    const db = drizzle(sql);

    const result = await db.update(invoices)
        .set({ status })
        .where(eq(invoices.id, id))
        .returning();

    if (result.length === 0) return c.json({ error: 'Invoice not found' }, 404);
    return c.json(result[0]);
});

export default app;
