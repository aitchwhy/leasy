import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register a Korean font
Font.register({
  family: 'NotoSansKR',
  src: 'https://fonts.gstatic.com/s/notosanskr/v13/PbykFmXiEBPT4ITbgNA5Cgm203Tq4JJWq209pU0DPdWuqxJ1.ttf' // Regular
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'NotoSansKR',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 5,
    marginBottom: 5,
  },
  label: {
    width: 100,
    fontSize: 10,
    color: '#555',
  },
  value: {
    fontSize: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 5,
    marginBottom: 5,
    backgroundColor: '#F0F0F0',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 5,
    marginBottom: 5,
  },
  colDesc: { width: '50%', fontSize: 10 },
  colAmount: { width: '25%', fontSize: 10, textAlign: 'right' },
  colVat: { width: '25%', fontSize: 10, textAlign: 'right' },
  total: {
    marginTop: 20,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: 'bold',
  }
});

import { InvoiceDetail } from '@/types/invoice';

// ... styles ...

type InvoicePDFProps = {
  invoice: InvoiceDetail;
  tenant: InvoiceDetail['tenant'];
  unit: InvoiceDetail['unit'];
  lineItems: InvoiceDetail['lineItems'];
};

export const InvoicePDF = ({ invoice, tenant, unit, lineItems }: InvoicePDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>INVOICE / 청구서</Text>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Invoice #:</Text>
          <Text style={styles.value}>{invoice.id}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{invoice.issueDate}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Due Date:</Text>
          <Text style={styles.value}>{invoice.dueDate}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={{ fontSize: 14, marginBottom: 10, fontWeight: 'bold' }}>Bill To:</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Tenant:</Text>
          <Text style={styles.value}>{tenant.name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Unit:</Text>
          <Text style={styles.value}>{unit.unitNumber}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.tableHeader}>
          <Text style={styles.colDesc}>Description</Text>
          <Text style={styles.colAmount}>Amount (KRW)</Text>
          <Text style={styles.colVat}>VAT (KRW)</Text>
        </View>
        {lineItems.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.colDesc}>{item.description}</Text>
            <Text style={styles.colAmount}>{Number(item.amountKrw).toLocaleString()}</Text>
            <Text style={styles.colVat}>{Number(item.vatKrw).toLocaleString()}</Text>
          </View>
        ))}
      </View>

      <View style={styles.total}>
        <Text>Total: {Number(invoice.totalAmountKrw).toLocaleString()} KRW</Text>
      </View>
    </Page>
  </Document>
);
