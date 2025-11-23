import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register Korean Font
Font.register({
  family: 'Noto Sans KR',
  src: 'https://fonts.gstatic.com/s/notosanskr/v13/PbykFmXiEBPT4ITbgNA5Cgm203Tq4JJWq209pU0DPdWuqxJ1.ttf', // Regular
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Noto Sans KR',
    fontSize: 10,
  },
  header: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
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
    paddingVertical: 5,
  },
  label: {
    width: '30%',
    fontWeight: 'bold',
  },
  value: {
    width: '70%',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 20,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 'auto',
    marginTop: 5,
    fontSize: 10,
  },
  totalSection: {
    marginTop: 20,
    borderTopWidth: 2,
    borderColor: '#000',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

interface InvoicePDFProps {
  invoice: any; // Replace with proper type
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>세금계산서 (Tax Invoice)</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {/* Supplier Section */}
        <View style={{ width: '48%', borderWidth: 1, padding: 5 }}>
            <Text style={{ fontSize: 12, marginBottom: 5, fontWeight: 'bold' }}>공급자 (Supplier)</Text>
            <View style={styles.row}>
                <Text style={styles.label}>등록번호:</Text>
                <Text style={styles.value}>123-45-67890</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>상호:</Text>
                <Text style={styles.value}>Leasy Property Mgmt</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>성명:</Text>
                <Text style={styles.value}>Hong Gil Dong</Text>
            </View>
        </View>

        {/* Customer Section */}
        <View style={{ width: '48%', borderWidth: 1, padding: 5 }}>
            <Text style={{ fontSize: 12, marginBottom: 5, fontWeight: 'bold' }}>공급받는자 (Customer)</Text>
            <View style={styles.row}>
                <Text style={styles.label}>등록번호:</Text>
                <Text style={styles.value}>{invoice?.tenant?.businessRegistrationId || '-'}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>상호:</Text>
                <Text style={styles.value}>{invoice?.tenant?.name || 'Unknown'}</Text>
            </View>
        </View>
      </View>

      {/* Summary Section */}
      <View style={{ marginTop: 20, borderWidth: 1, padding: 5 }}>
        <View style={styles.row}>
            <Text style={{ width: '25%' }}>작성일자: {invoice?.issueDate}</Text>
            <Text style={{ width: '25%' }}>공급가액: {parseInt(invoice?.totalAmountKrw || '0').toLocaleString()} KRW</Text>
            <Text style={{ width: '25%' }}>세액: -</Text>
            <Text style={{ width: '25%' }}>비고: </Text>
        </View>
      </View>

      {/* Line Items Table */}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>품목 (Item)</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>공급가액 (Amount)</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>세액 (VAT)</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>비고 (Note)</Text>
          </View>
        </View>

        {/* Example Row - Iterate real items here */}
        <View style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Rent (11월분)</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>{parseInt(invoice?.totalAmountKrw || '0').toLocaleString()}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>0</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>-</Text>
          </View>
        </View>
      </View>

      <View style={styles.totalSection}>
        <Text style={{ fontSize: 14, fontWeight: 'bold' }}>
            합계금액 (Total): {parseInt(invoice?.totalAmountKrw || '0').toLocaleString()} KRW
        </Text>
      </View>

    </Page>
  </Document>
);
