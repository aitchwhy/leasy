import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { invoices, invoiceLineItems, leases, tenants, units, utilityMeters, utilityReadings } from '@leasy/db';
import { eq, and, lte, gte, desc } from 'drizzle-orm';
import { getDb, Bindings } from '../lib/db';
import { InvoiceCalculator } from '@leasy/domain';
import { Decimal } from 'decimal.js';

const app = new Hono<{ Bindings: Bindings }>();

const generateInvoiceSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

app.post('/generate', zValidator('json', generateInvoiceSchema), async (c) => {
  const { year, month, dueDate } = c.req.valid('json');
  const db = getDb(c);

  // Define billing period
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of month
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  // Previous month for utility readings
  const prevMonthDate = new Date(year, month - 2, 1);
  const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthStr = `${year}-${String(month).padStart(2, '0')}`;

  // Fetch active leases overlapping with the period
  const activeLeases = await db.select().from(leases).where(
      and(
          eq(leases.isActive, true),
          lte(leases.startDate, endDateStr)
      )
  );

  const generatedInvoices = [];

  // Fixed Utility Rates (MVP)
  const ELEC_RATE = new Decimal(200); // KRW per kWh
  const WATER_RATE = new Decimal(1000); // KRW per Unit

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

      // 3. Calculate Utilities
      // Fetch readings for this unit
      // We need readings for THIS month (end of period) and PREVIOUS month (start of period)
      // Actually, usually "Month M Invoice" charges for usage in Month M-1 or M?
      // Let's assume we charge for the usage captured by readings in Month M vs Month M-1.
      // Reading Date ~ End of Month.

      // Fetch Current Reading (closest to endDate)
      // Fetch Previous Reading (closest to startDate)
      // For MVP, let's assume readings are tagged with the billing period or just date.
      // Let's fetch all readings for the unit and find the ones matching our expected dates.
      // Optimization: Could do this in bulk query outside loop.

      const meters = await db.select().from(utilityMeters).where(eq(utilityMeters.unitId, lease.unitId));

      let elecCost = new Decimal(0);
      let elecVat = new Decimal(0);
      let waterCost = new Decimal(0);

      // Process Electricity
      const elecMeter = meters.find(m => m.type === 'ELECTRICITY');
      if (elecMeter) {
          // Find readings. Simplified logic: Look for reading in current month and prev month
          // In real app, strict date matching is needed.
          const currentReading = await db.select().from(utilityReadings)
              .where(and(
                  eq(utilityReadings.meterId, elecMeter.id),
                  // Simple check: readingDate within current month
                  gte(utilityReadings.readingDate, startDateStr),
                  lte(utilityReadings.readingDate, endDateStr)
              ))
              .orderBy(desc(utilityReadings.readingDate))
              .limit(1);

          const prevReading = await db.select().from(utilityReadings)
               .where(and(
                  eq(utilityReadings.meterId, elecMeter.id),
                  lte(utilityReadings.readingDate, startDateStr)
               ))
               .orderBy(desc(utilityReadings.readingDate))
               .limit(1);

          if (currentReading.length > 0 && prevReading.length > 0) {
              const usage = InvoiceCalculator.calculateUtilityUsage(currentReading[0].value, prevReading[0].value);
              const totalElec = new Decimal(usage).mul(ELEC_RATE);

              // Apply VAT Rule
              const { cost, vat } = InvoiceCalculator.calculateElectricityVat(totalElec);
              elecCost = cost;
              elecVat = vat;
          }
      }

      // Process Water
      const waterMeter = meters.find(m => m.type === 'WATER');
      if (waterMeter) {
           const currentReading = await db.select().from(utilityReadings)
              .where(and(
                  eq(utilityReadings.meterId, waterMeter.id),
                  gte(utilityReadings.readingDate, startDateStr),
                  lte(utilityReadings.readingDate, endDateStr)
              ))
              .orderBy(desc(utilityReadings.readingDate))
              .limit(1);

          const prevReading = await db.select().from(utilityReadings)
               .where(and(
                  eq(utilityReadings.meterId, waterMeter.id),
                  lte(utilityReadings.readingDate, startDateStr)
               ))
               .orderBy(desc(utilityReadings.readingDate))
               .limit(1);

          if (currentReading.length > 0 && prevReading.length > 0) {
              const usage = InvoiceCalculator.calculateUtilityUsage(currentReading[0].value, prevReading[0].value);
              waterCost = new Decimal(usage).mul(WATER_RATE);
              // Water usually no VAT or included? Let's assume NO VAT for MVP or included in cost (simple).
          }
      }

      // 4. Create Invoice Record
      const totalAmount = rentTotal.add(mgmtFeeTotal).add(elecCost).add(elecVat).add(waterCost);

      const [invoice] = await db.insert(invoices).values({
          leaseId: lease.id,
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: dueDate,
          totalAmountKrw: totalAmount.toString(),
          status: 'DRAFT',
          billingPeriod: `${year}-${String(month).padStart(2, '0')}`,
      }).returning();

      // 5. Create Line Items
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

      // Electricity
      if (!elecCost.isZero()) {
           await db.insert(invoiceLineItems).values({
              invoiceId: invoice.id,
              type: 'ELEC_COST',
              description: `${month}월 전기요금`,
              amountKrw: elecCost.toString(),
              vatKrw: elecVat.toString(),
          });
      }

      // Water
      if (!waterCost.isZero()) {
           await db.insert(invoiceLineItems).values({
              invoiceId: invoice.id,
              type: 'WATER_COST',
              description: `${month}월 수도요금`,
              amountKrw: waterCost.toString(),
              vatKrw: '0',
          });
      }

      generatedInvoices.push(invoice);
  }

  return c.json({ count: generatedInvoices.length, invoices: generatedInvoices }, 201);
});

app.get('/', async (c) => {
    const db = getDb(c);
    const result = await db.select().from(invoices);
    return c.json(result);
});

app.get('/:id', async (c) => {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

    const db = getDb(c);

    const invoice = await db.select().from(invoices).where(eq(invoices.id, id));
    if (invoice.length === 0) return c.json({ error: 'Invoice not found' }, 404);

    const lines = await db.select().from(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, id));

    // Fetch related data (Lease, Tenant, Unit)
    // In a real app, we might want to join these or fetch them.
    // For PDF, we need Tenant Name, Unit Number, etc.
    // Let's do a join or separate fetches. Drizzle doesn't support deep relations easily without `with`.
    // We'll just fetch lease and tenant manually for now or use a join query.

    const leaseRes = await db.select().from(leases).where(eq(leases.id, invoice[0].leaseId));
    const lease = leaseRes[0];

    const tenantRes = await db.select().from(tenants).where(eq(tenants.id, lease.tenantId));
    const tenant = tenantRes[0];

    const unitRes = await db.select().from(units).where(eq(units.id, lease.unitId));
    const unit = unitRes[0];

    return c.json({
        ...invoice[0],
        lineItems: lines,
        lease,
        tenant,
        unit,
    });
});

const updateStatusSchema = z.object({
    status: z.enum(['DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'VOID']),
});

app.put('/:id/status', zValidator('json', updateStatusSchema), async (c) => {
    const id = Number(c.req.param('id'));
    if (isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

    const { status } = c.req.valid('json');
    const db = getDb(c);

    const result = await db.update(invoices)
        .set({ status })
        .where(eq(invoices.id, id))
        .returning();

    if (result.length === 0) return c.json({ error: 'Invoice not found' }, 404);
    return c.json(result[0]);
});

export default app;
