import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Invoice, Tenant, Building } from '@/shared/types'
import { db } from '../db/store'

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  companyInfo: {
    fontSize: 12,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: 100,
    fontSize: 12,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 12,
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 5,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  tableCol: {
    fontSize: 12,
  },
  descriptionCol: {
    width: '60%',
  },
  amountCol: {
    width: '40%',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: {
    width: '60%',
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalAmount: {
    width: '40%',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  footer: {
    marginTop: 30,
    fontSize: 10,
    textAlign: 'center',
  },
})

interface InvoiceTemplateProps {
  invoice: Invoice
  tenant: Tenant
  building: Building
}

function InvoiceTemplate({ invoice, tenant, building }: InvoiceTemplateProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
          <View style={styles.companyInfo}>
            <Text>Leasy Property Management</Text>
            <Text>123 Business Ave, Suite 100</Text>
            <Text>New York, NY 10001</Text>
            <Text>Phone: (555) 123-4567</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice No:</Text>
            <Text style={styles.value}>{invoice.invoiceNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{new Date(invoice.createdAt).toLocaleDateString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Period:</Text>
            <Text style={styles.value}>
              {new Date(invoice.periodStart).toLocaleDateString()} - {new Date(invoice.periodEnd).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Tenant:</Text>
            <Text style={styles.value}>{tenant.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Unit:</Text>
            <Text style={styles.value}>{tenant.unitNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Building:</Text>
            <Text style={styles.value}>{building.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{tenant.email}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCol, styles.descriptionCol]}>Description</Text>
            <Text style={[styles.tableCol, styles.amountCol]}>Amount</Text>
          </View>
          {invoice.lineItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCol, styles.descriptionCol]}>{item.description}</Text>
              <Text style={[styles.tableCol, styles.amountCol]}>${item.amount.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount Due:</Text>
            <Text style={styles.totalAmount}>${invoice.totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Payment is due within 30 days of invoice date.</Text>
          <Text>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  )
}

export async function generateInvoicePDF(invoiceId: string): Promise<Buffer> {
  const invoice = db.getInvoiceById(invoiceId)
  if (!invoice) {
    throw new Error('Invoice not found')
  }

  const tenant = db.getTenantById(invoice.tenantId)
  if (!tenant) {
    throw new Error('Tenant not found')
  }

  const building = db.getBuildingById(invoice.buildingId)
  if (!building) {
    throw new Error('Building not found')
  }

  const buffer = await renderToBuffer(
    <InvoiceTemplate invoice={invoice} tenant={tenant} building={building} />
  )

  return buffer
}