import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { InvoiceWithRelations } from '@/lib/api/invoices';

// Define styles that match the invoice design
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 48,
    color: '#4A5568',
    textAlign: 'right',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  invoiceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  invoiceNumber: {
    fontSize: 12,
    color: '#4A5568',
    fontWeight: 'bold',
  },
  invoiceDate: {
    fontSize: 12,
    color: '#4A5568',
  },
  customerSection: {
    marginBottom: 40,
  },
  customerLabel: {
    fontSize: 12,
    color: '#4A5568',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  customerName: {
    fontSize: 12,
    color: '#2D3748',
    marginBottom: 20,
  },
  table: {
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4A5568',
    padding: 8,
  },
  tableHeaderText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#F7FAFC',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableRowEven: {
    flexDirection: 'row',
    backgroundColor: '#EDF2F7',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableCellText: {
    fontSize: 10,
    color: '#2D3748',
    textAlign: 'center',
  },
  tableCellTextLeft: {
    fontSize: 10,
    color: '#2D3748',
    textAlign: 'left',
  },
  tableCellTextRight: {
    fontSize: 10,
    color: '#2D3748',
    textAlign: 'right',
  },
  // Column widths
  qtyCol: { width: '8%' },
  itemCol: { width: '20%' },
  descCol: { width: '32%' },
  priceCol: { width: '15%' },
  discountCol: { width: '12%' },
  totalCol: { width: '13%' },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  paymentInfo: {
    width: '60%',
    fontSize: 10,
    color: '#4A5568',
    lineHeight: 1.4,
  },
  totalSection: {
    width: '35%',
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    padding: 8,
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  totalAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  signature: {
    marginTop: 60,
    textAlign: 'right',
  },
  signatureText: {
    fontSize: 12,
    color: '#4A5568',
    marginBottom: 40,
  },
  signatureName: {
    fontSize: 12,
    color: '#2D3748',
    fontWeight: 'bold',
  },
});

interface InvoicePDFProps {
  invoice: InvoiceWithRelations;
  companyInfo?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ 
  invoice, 
  companyInfo = {
    name: "Your Company Name",
    bankName: "BCA",
    accountNumber: "7650543704",
    accountHolder: "Nuroji Lukman Syah"
  }
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount).replace('IDR', 'Rp');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Invoice Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Invoice</Text>
        </View>

        {/* Invoice Number and Date */}
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceNumber}>
            Invoice No: {invoice.invoiceNumber}
          </Text>
          <Text style={styles.invoiceDate}>
            Date: {formatDate(invoice.dateIssued)}
          </Text>
        </View>

        {/* Customer Information */}
        <View style={styles.customerSection}>
          <Text style={styles.customerLabel}>Customer:</Text>
          <Text style={styles.customerName}>
            {invoice.client?.name}
            {invoice.client?.company && ` - ${invoice.client.company}`}
          </Text>
        </View>

        {/* Invoice Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={styles.qtyCol}>
              <Text style={styles.tableHeaderText}>Qty</Text>
            </View>
            <View style={styles.itemCol}>
              <Text style={styles.tableHeaderText}>Item #</Text>
            </View>
            <View style={styles.descCol}>
              <Text style={styles.tableHeaderText}>Description</Text>
            </View>
            <View style={styles.priceCol}>
              <Text style={styles.tableHeaderText}>Unit Price</Text>
            </View>
            <View style={styles.discountCol}>
              <Text style={styles.tableHeaderText}>Discount</Text>
            </View>
            <View style={styles.totalCol}>
              <Text style={styles.tableHeaderText}>Line Total</Text>
            </View>
          </View>

          {/* Table Rows */}
          {invoice.lineItems?.map((item, index) => (
            <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
              <View style={styles.qtyCol}>
                <Text style={styles.tableCellText}>{item.quantity}</Text>
              </View>
              <View style={styles.itemCol}>
                <Text style={styles.tableCellText}>
                  {item.description.split(' ').slice(0, 2).join(' ')}
                </Text>
              </View>
              <View style={styles.descCol}>
                <Text style={styles.tableCellTextLeft}>{item.description}</Text>
              </View>
              <View style={styles.priceCol}>
                <Text style={styles.tableCellTextRight}>{formatCurrency(item.unitPrice)}</Text>
              </View>
              <View style={styles.discountCol}>
                <Text style={styles.tableCellText}>-</Text>
              </View>
              <View style={styles.totalCol}>
                <Text style={styles.tableCellTextRight}>{formatCurrency(item.totalPrice)}</Text>
              </View>
            </View>
          ))}

          {/* Empty rows to match the design */}
          {Array.from({ length: Math.max(0, 4 - (invoice.lineItems?.length || 0)) }).map((_, index) => (
            <View key={`empty-${index}`} style={index % 2 === (invoice.lineItems?.length || 0) % 2 ? styles.tableRowEven : styles.tableRow}>
              <View style={styles.qtyCol}>
                <Text style={styles.tableCellText}>-</Text>
              </View>
              <View style={styles.itemCol}>
                <Text style={styles.tableCellText}>-</Text>
              </View>
              <View style={styles.descCol}>
                <Text style={styles.tableCellText}>-</Text>
              </View>
              <View style={styles.priceCol}>
                <Text style={styles.tableCellText}>-</Text>
              </View>
              <View style={styles.discountCol}>
                <Text style={styles.tableCellText}>-</Text>
              </View>
              <View style={styles.totalCol}>
                <Text style={styles.tableCellText}>-</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footer with Payment Info and Total */}
        <View style={styles.footer}>
          <View style={styles.paymentInfo}>
            <Text>Payment can be made via Bank Transfer payable to:</Text>
            <Text>{companyInfo.accountHolder}</Text>
            <Text>Bank: {companyInfo.bankName}</Text>
            <Text>Account No: {companyInfo.accountNumber}</Text>
          </View>
          
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{formatCurrency(invoice.totalAmount || 0)}</Text>
            </View>
          </View>
        </View>

        {/* Signature */}
        <View style={styles.signature}>
          <Text style={styles.signatureText}>Best Regards,</Text>
          <Text style={styles.signatureName}>{companyInfo.accountHolder}</Text>
        </View>
      </Page>
    </Document>
  );
}; 