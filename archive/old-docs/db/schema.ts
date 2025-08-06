import { date, decimal, pgEnum, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const building = pgTable("Building", {
  building_id: serial("building_id").primaryKey(),
  name: varchar("name", { length: 255 }),
  address: varchar("address", { length: 255 }),
});

export const tenant = pgTable("Tenant", {
  tenant_id: serial("tenant_id").primaryKey(),
  name: varchar("name", { length: 255 }),
  contact: varchar("contact", { length: 255 }),
});

export const leaseContract = pgTable("LeaseContract", {
  lease_id: serial("lease_id").primaryKey(),
  building_id: serial("building_id").references(() => building.building_id),
  tenant_id: serial("tenant_id").references(() => tenant.tenant_id),
  start_date: date("start_date"),
  end_date: date("end_date"),
  rent_amount: decimal("rent_amount", { precision: 10, scale: 2 }),
});

export const invoiceStatusEnum = pgEnum("invoice_status", ["draft", "sent", "paid", "void"]);

export const invoice = pgTable("Invoice", {
  invoice_id: serial("invoice_id").primaryKey(),
  lease_id: serial("lease_id").references(() => leaseContract.lease_id),
  issue_date: date("issue_date"),
  due_date: date("due_date"),
  total_amount: decimal("total_amount", { precision: 10, scale: 2 }),
  status: invoiceStatusEnum("status"),
});

export const payment = pgTable("Payment", {
  payment_id: serial("payment_id").primaryKey(),
  invoice_id: serial("invoice_id").references(() => invoice.invoice_id),
  payment_date: date("payment_date"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
});
