import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyCg4QxlF.ttf' }
  ]
});

// 4x6 inches is roughly 288x432 points in PDF standard
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 10,
  },
  logo: {
    width: 40,
    height: 40,
    objectFit: 'contain',
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
    color: '#555555',
  },
  addressBox: {
    marginBottom: 20,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 12,
    marginBottom: 2,
    lineHeight: 1.3,
  },
  trackingBox: {
    marginTop: 'auto',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#000000',
    paddingTop: 10,
  },
  trackingPlaceholderText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  orderInfo: {
    fontSize: 10,
    color: '#777777',
    marginTop: 4,
  }
});

interface ShippingLabelPDFProps {
  invoice: any;
  logoUrl?: string;
}

export const ShippingLabelPDF: React.FC<ShippingLabelPDFProps> = ({ invoice, logoUrl }) => {
  const { customer } = invoice;

  return (
    <Document>
      <Page size={[288, 432]} style={styles.page}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          {logoUrl && <Image src={logoUrl} style={styles.logo} />}
          <View style={{ justifyContent: 'center' }}>
            <Text style={styles.headerText}>PRIORITY</Text>
          </View>
        </View>

        {/* From Address */}
        <View style={styles.addressBox}>
          <Text style={styles.sectionTitle}>From:</Text>
          <Text style={styles.addressText}>NB57's Nostalgia</Text>
          <Text style={styles.addressText}>Professor Oak's Laboratory</Text>
          <Text style={styles.addressText}>Pallet Town, Kanto Region</Text>
        </View>

        {/* To Address */}
        <View style={[styles.addressBox, { marginTop: 10 }]}>
          <Text style={styles.sectionTitle}>To:</Text>
          <Text style={styles.name}>{customer.name}</Text>
          {customer.address && <Text style={styles.addressText}>{customer.address}</Text>}
          <Text style={styles.addressText}>
            {[customer.city, customer.state, customer.pin].filter(Boolean).join(', ')}
          </Text>
          {customer.country && <Text style={styles.addressText}>{customer.country}</Text>}
          {customer.phone && <Text style={[styles.addressText, { marginTop: 5 }]}>Ph: {customer.phone}</Text>}
        </View>

        {/* Tracking Placeholder */}
        <View style={styles.trackingBox}>
          {invoice.trackingNumber ? (
            <Text style={styles.trackingPlaceholderText}>{invoice.trackingNumber}</Text>
          ) : (
            <Text style={styles.trackingPlaceholderText}>[ PLACE TRACKING HERE ]</Text>
          )}
          <Text style={styles.orderInfo}>Order: {invoice.invoiceNumber}</Text>
        </View>

      </Page>
    </Document>
  );
};
