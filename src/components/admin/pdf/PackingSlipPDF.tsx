import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyCg4QxlF.ttf' }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain',
    marginBottom: 10,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  detailText: {
    fontSize: 10,
    color: '#333333',
    marginBottom: 4,
  },
  detailLabel: {
    fontWeight: 'bold',
    marginRight: 4,
  },
  addressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  addressBox: {
    width: '45%',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 4,
  },
  customerName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  table: {
    width: '100%',
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 11,
  },
  colCheck: { flex: 0.5 },
  colItem: { flex: 4 },
  colSku: { flex: 2 },
  colQty: { flex: 1, textAlign: 'center' },
  checkBox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#000000',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 20,
  },
  footerText: {
    fontSize: 10,
    color: '#777777',
    marginBottom: 4,
  },
});

interface PackingSlipPDFProps {
  invoice: any;
  logoUrl?: string;
}

export const PackingSlipPDF: React.FC<PackingSlipPDFProps> = ({ invoice, logoUrl }) => {
  const { customer, items } = invoice;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            {logoUrl && <Image src={logoUrl} style={styles.logo} />}
            <Text style={styles.companyName}>NB57's Nostalgia</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.invoiceTitle}>PACKING SLIP</Text>
            <Text style={styles.detailText}><Text style={styles.detailLabel}>Order No:</Text> {invoice.invoiceNumber}</Text>
            <Text style={styles.detailText}><Text style={styles.detailLabel}>Date:</Text> {new Date().toLocaleDateString('en-IN')}</Text>
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.addressSection}>
          <View style={styles.addressBox}>
            <Text style={styles.sectionTitle}>Ship To</Text>
            <Text style={styles.customerName}>{customer.name}</Text>
            {customer.address && <Text style={styles.detailText}>{customer.address}</Text>}
            <Text style={styles.detailText}>
              {[customer.city, customer.state, customer.pin].filter(Boolean).join(', ')}
            </Text>
            {customer.country && <Text style={styles.detailText}>{customer.country}</Text>}
            {customer.phone && <Text style={styles.detailText}>Phone: {customer.phone}</Text>}
          </View>
          
          <View style={styles.addressBox}>
            <Text style={styles.sectionTitle}>Return Address</Text>
            <Text style={styles.customerName}>NB57's Nostalgia</Text>
            <Text style={styles.detailText}>123 Vintage Lane, History District</Text>
            <Text style={styles.detailText}>New Delhi, DL 110001</Text>
            <Text style={styles.detailText}>India</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colCheck]}>Pack</Text>
            <Text style={[styles.tableHeaderCell, styles.colItem]}>Item Description</Text>
            <Text style={[styles.tableHeaderCell, styles.colSku]}>Collection ID</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
          </View>
          
          {items.map((item: any) => (
            <View key={item.id} style={styles.tableRow}>
              <View style={styles.colCheck}>
                <View style={styles.checkBox}></View>
              </View>
              <Text style={[styles.tableCell, styles.colItem]}>{item.itemName}</Text>
              <Text style={[styles.tableCell, styles.colSku]}>{item.itemSku}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Please check off items as they are packed.</Text>
          <Text style={styles.footerText}>Generated by NB57's Nostalgia</Text>
        </View>
      </Page>
    </Document>
  );
};
