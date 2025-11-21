import { pgTable, serial, text, integer, decimal, date, boolean, pgEnum, timestamp, unique } from 'drizzle-orm/pg-core';

// Enums
export const utilityTypeEnum = pgEnum('utility_type', ['ELECTRICITY', 'WATER']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'VOID']);
export const lineItemTypeEnum = pgEnum('line_item_type', ['RENT', 'MANAGEMENT_FEE', 'ELEC_COST', 'ELEC_VAT', 'WATER_COST', 'OTHER']);

// Tables
export const buildings = pgTable('buildings', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  electricityCustomerId: text('electricity_customer_id'), // 고객번호
  waterCustomerId: text('water_customer_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const units = pgTable('units', {
  id: serial('id').primaryKey(),
  buildingId: integer('building_id').references(() => buildings.id).notNull(),
  unitNumber: text('unit_number').notNull(), // 호수 (e.g., 'B101')
  areaSqm: decimal('area_sqm').notNull(),    // 면적
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  buildingUnitUnique: unique('building_unit_unique').on(table.buildingId, table.unitNumber),
}));

export const tenants = pgTable('tenants', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),                      // 상호
  businessRegistrationId: text('business_registration_id').unique(), // 사업자번호
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const leases = pgTable('leases', {
  id: serial('id').primaryKey(),
  unitId: integer('unit_id').references(() => units.id).notNull(),
  tenantId: integer('tenant_id').references(() => tenants.id).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  baseRentKrw: decimal('base_rent_krw').notNull(),      // 임대료 (VAT excluded)
  managementFeeKrw: decimal('management_fee_krw').default("0").notNull(),
  depositKrw: decimal('deposit_krw').notNull(),         // 보증금
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const utilityMeters = pgTable('utility_meters', {
  id: serial('id').primaryKey(),
  unitId: integer('unit_id').references(() => units.id).notNull(),
  type: utilityTypeEnum('type').notNull(),
});

export const utilityReadings = pgTable('utility_readings', {
  id: serial('id').primaryKey(),
  meterId: integer('meter_id').references(() => utilityMeters.id).notNull(),
  readingDate: date('reading_date').notNull(),
  value: integer('value').notNull(), // 지침 (Raw meter reading)
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const invoices = pgTable('invoices', {
    id: serial('id').primaryKey(),
    leaseId: integer('lease_id').references(() => leases.id).notNull(),
    billingPeriod: text('billing_period').notNull(), // YYYY-MM
    issueDate: date('issue_date').notNull(),
    dueDate: date('due_date').notNull(),
    totalAmountKrw: decimal('total_amount_krw').notNull(), // VAT포함 합계
    status: invoiceStatusEnum('status').default('DRAFT').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const invoiceLineItems = pgTable('invoice_line_items', {
    id: serial('id').primaryKey(),
    invoiceId: integer('invoice_id').references(() => invoices.id).notNull(),
    type: lineItemTypeEnum('type').notNull(),
    description: text('description').notNull(),
    amountKrw: decimal('amount_krw').notNull(),     // 공급가액 (Base amount)
    vatKrw: decimal('vat_krw').notNull(),           // 부가세 (VAT amount)
});
