import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { InvoiceWithRelations } from '@/lib/api/invoices-server';

// Define styles that match the invoice design exactly
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 64,
    color: '#6B7280',
    textAlign: 'right',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  invoiceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    fontSize: 11,
  },
  invoiceNumber: {
    fontSize: 11,
    color: '#374151',
    fontWeight: 'normal',
  },
  invoiceDate: {
    fontSize: 11,
    color: '#374151',
    textAlign: 'right',
  },
  customerSection: {
    marginBottom: 40,
  },
  customerLabel: {
    fontSize: 11,
    color: '#374151',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 30,
  },
  table: {
    marginBottom: 40,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#6B7280',
    padding: 10,
  },
  tableHeaderText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 35,
  },
  tableRowEven: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    minHeight: 35,
  },
  tableCellText: {
    fontSize: 11,
    color: '#374151',
    textAlign: 'center',
    paddingTop: 5,
  },
  tableCellTextLeft: {
    fontSize: 11,
    color: '#374151',
    textAlign: 'left',
    paddingTop: 5,
  },
  tableCellTextRight: {
    fontSize: 11,
    color: '#374151',
    textAlign: 'right',
    paddingTop: 5,
  },
  // Column widths matching the design
  qtyCol: { width: '8%', justifyContent: 'center' },
  itemCol: { width: '20%', justifyContent: 'center' },
  descCol: { width: '32%', justifyContent: 'center' },
  priceCol: { width: '15%', justifyContent: 'center' },
  discountCol: { width: '12%', justifyContent: 'center' },
  totalCol: { width: '13%', justifyContent: 'center' },
  
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  paymentInfo: {
    width: '60%',
    fontSize: 11,
    color: '#374151',
    lineHeight: 1.5,
  },
  totalSection: {
    width: '35%',
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 12,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  totalAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
  },
  signature: {
    marginTop: 80,
    textAlign: 'right',
  },
  signatureText: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 50,
  },
  signatureName: {
    fontSize: 11,
    color: '#374151',
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
    }).format(amount).replace('IDR', 'Rp ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `Dec ${day}${day === 5 ? 'th' : 'th'}, ${year}`;
  };

  // Ensure we have at least 4 rows total (including empty ones)
  const lineItems = invoice.lineItems || [];
  const emptyRowsNeeded = Math.max(0, 4 - lineItems.length);

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
            Date :{formatDate(invoice.dateIssued)}
          </Text>
        </View>

        {/* Customer Information */}
        <View style={styles.customerSection}>
          <Text style={styles.customerLabel}>Customer :</Text>
          <Text style={styles.customerName}>
            {invoice.client?.name || 'No client specified'}
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

          {/* Actual line items */}
          {lineItems.map((item, index) => (
            <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
              <View style={styles.qtyCol}>
                <Text style={styles.tableCellText}>{item.quantity || 1}</Text>
              </View>
              <View style={styles.itemCol}>
                <Text style={styles.tableCellText}>
                  {item.description?.split(' ').slice(0, 2).join(' ') || 'Item'}
                </Text>
              </View>
              <View style={styles.descCol}>
                <Text style={styles.tableCellTextLeft}>{item.description || 'No description'}</Text>
              </View>
              <View style={styles.priceCol}>
                <Text style={styles.tableCellTextRight}>{formatCurrency(item.unitPrice || 0)}</Text>
              </View>
              <View style={styles.discountCol}>
                <Text style={styles.tableCellText}>-</Text>
              </View>
              <View style={styles.totalCol}>
                <Text style={styles.tableCellTextRight}>{formatCurrency(item.totalPrice || (item.quantity || 1) * (item.unitPrice || 0))}</Text>
              </View>
            </View>
          ))}

          {/* Empty rows to fill the table */}
          {Array.from({ length: emptyRowsNeeded }).map((_, index) => (
            <View key={`empty-${index}`} style={(lineItems.length + index) % 2 === 0 ? styles.tableRow : styles.tableRowEven}>
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
            <Text>Account No : {companyInfo.accountNumber}</Text>
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