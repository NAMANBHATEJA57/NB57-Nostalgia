import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Register a classic, clean font if needed, or use default standard fonts (Helvetica)
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyCg4QxlF.ttf' } // Placeholder for custom font if needed
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
  companyDetails: {
    fontSize: 9,
    color: '#333333',
    lineHeight: 1.4,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  invoiceDetailsRight: {
    alignItems: 'flex-end',
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
  customerSection: {
    marginBottom: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    fontSize: 9,
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
  },
  tableCell: {
    fontSize: 10,
  },
  colItem: { flex: 4 },
  colSku: { flex: 2 },
  colQty: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 2, textAlign: 'right' },
  colAmount: { flex: 2, textAlign: 'right' },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 40,
  },
  totalsBox: {
    width: 250,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 10,
    color: '#555555',
  },
  totalValue: {
    fontSize: 10,
    textAlign: 'right',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#000000',
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
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
    fontSize: 9,
    color: '#777777',
    marginBottom: 4,
  },
  qrCodeBox: {
    marginTop: 20,
    alignItems: 'center',
  },
  qrCodeImage: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  qrCodeText: {
    fontSize: 9,
    color: '#555555',
  },
  notesBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F9F9F9',
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  notesText: {
    fontSize: 9,
    lineHeight: 1.4,
  }
});

interface InvoicePDFProps {
  invoice: any;
  logoUrl?: string;
  qrCodeUrl?: string; // e.g. generate this externally and pass
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, logoUrl, qrCodeUrl }) => {
  const { customer, items } = invoice;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            {logoUrl && <Image src={logoUrl} style={styles.logo} />}
            <Text style={styles.companyName}>NB57's Nostalgia</Text>
            {/* STORED BUSINESS DETAILS (HIDDEN FROM INVOICE)
            <Text style={styles.companyDetails}>Professor Oak's Laboratory</Text>
            <Text style={styles.companyDetails}>Pallet Town, Kanto Region</Text>
            <Text style={styles.companyDetails}>Email: contact@nb57nostalgia.com</Text>
            <Text style={styles.companyDetails}>Phone: +91 9811535385</Text>
            <Text style={styles.companyDetails}>Website: www.nb57nostalgia.com</Text>
            */}
          </View>
          <View style={styles.invoiceDetailsRight}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.detailText}><Text style={styles.detailLabel}>No:</Text> {invoice.invoiceNumber}</Text>
            <Text style={styles.detailText}><Text style={styles.detailLabel}>Date:</Text> {new Date(invoice.createdAt).toLocaleDateString('en-IN')}</Text>
            <Text style={styles.detailText}><Text style={styles.detailLabel}>Status:</Text> {invoice.paymentStatus}</Text>
          </View>
        </View>

        {/* Customer Section */}
        <View style={styles.customerSection}>
          <Text style={styles.sectionTitle}>Billed To</Text>
          <Text style={styles.customerName}>{customer.name}</Text>
          {customer.phone && <Text style={styles.detailText}>{customer.phone}</Text>}
          {customer.email && <Text style={styles.detailText}>{customer.email}</Text>}
          {customer.address && <Text style={styles.detailText}>{customer.address}</Text>}
          <Text style={styles.detailText}>
            {[customer.city, customer.state, customer.pin, customer.country].filter(Boolean).join(', ')}
          </Text>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colItem]}>Item Name</Text>
            <Text style={[styles.tableHeaderCell, styles.colSku]}>Collection ID</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>Price</Text>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>Amount</Text>
          </View>
          
          {items.map((item: any) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colItem]}>{item.itemName}</Text>
              <Text style={[styles.tableCell, styles.colSku]}>{item.itemSku}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colPrice]}>₹{item.unitPrice.toLocaleString('en-IN')}</Text>
              <Text style={[styles.tableCell, styles.colAmount]}>₹{item.totalPrice.toLocaleString('en-IN')}</Text>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>₹{invoice.subtotal.toLocaleString('en-IN')}</Text>
            </View>
            
            {invoice.discountAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount {invoice.discountPercent ? `(${invoice.discountPercent}%)` : ''}</Text>
                <Text style={styles.totalValue}>- ₹{invoice.discountAmount.toLocaleString('en-IN')}</Text>
              </View>
            )}

            {invoice.taxAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax {invoice.taxPercent ? `(${invoice.taxPercent}%)` : ''}</Text>
                <Text style={styles.totalValue}>₹{invoice.taxAmount.toLocaleString('en-IN')}</Text>
              </View>
            )}

            {invoice.shippingCharge > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Shipping</Text>
                <Text style={styles.totalValue}>₹{invoice.shippingCharge.toLocaleString('en-IN')}</Text>
              </View>
            )}

            {invoice.packagingCharge > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Packaging</Text>
                <Text style={styles.totalValue}>₹{invoice.packagingCharge.toLocaleString('en-IN')}</Text>
              </View>
            )}

            {invoice.miscCharge > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Misc Charges</Text>
                <Text style={styles.totalValue}>₹{invoice.miscCharge.toLocaleString('en-IN')}</Text>
              </View>
            )}

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>₹{invoice.grandTotal.toLocaleString('en-IN')}</Text>
            </View>
            
            <View style={[styles.totalRow, { marginTop: 10 }]}>
              <Text style={styles.totalLabel}>Payment Method</Text>
              <Text style={styles.totalValue}>{invoice.paymentMethod || 'N/A'}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Payment Status</Text>
              <Text style={styles.totalValue}>{invoice.paymentStatus}</Text>
            </View>
          </View>
        </View>

        {/* QR Code for Pending */}
        {invoice.paymentStatus === 'Pending' && qrCodeUrl && (
          <View style={styles.qrCodeBox}>
            <Image src={qrCodeUrl} style={styles.qrCodeImage} />
            <Text style={styles.qrCodeText}>Scan to Pay via UPI</Text>
          </View>
        )}

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for supporting vintage collectibles.</Text>
          <Text style={styles.footerText}>Generated by NB57's Nostalgia</Text>
        </View>
      </Page>
    </Document>
  );
};
