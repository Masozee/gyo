"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { InvoiceWithRelations } from '@/lib/api/invoices';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Building2,
  Mail,
  Calendar,
  DollarSign,
  Download,
  Edit,
  MoreHorizontal,
  FileText,
  History,
  Copy,
} from 'lucide-react';

const statusConfig = {
  DRAFT: { color: 'bg-slate-100 text-slate-800', icon: Clock, label: 'Draft' },
  SENT: { color: 'bg-blue-100 text-blue-800', icon: Send, label: 'Sent' },
  PAID: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Paid' },
  OVERDUE: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Overdue' },
  CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
} as const;

export default function InvoiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = parseInt(params.id as string);

  const [invoice, setInvoice] = useState<InvoiceWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/invoices/${invoiceId}`);
        if (!response.ok) throw new Error('Failed to fetch invoice');
        const data = await response.json();
        setInvoice(data);
      } catch (error) {
        console.error('Failed to load invoice:', error);
        toast.error('Failed to load invoice details');
        router.push('/invoices');
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      loadInvoice();
    }
  }, [invoiceId, router]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount?: number | null) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice?.currency || 'USD',
    }).format(amount);
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`);
      if (!response.ok) throw new Error('Failed to generate PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Invoice-${invoice?.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Failed to download PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) throw new Error('Failed to update status');
      
      toast.success('Invoice status updated successfully');
      
      // Reload invoice data
      const response2 = await fetch(`/api/invoices/${invoiceId}`);
      const data = await response2.json();
      setInvoice(data);
    } catch (error) {
      console.error('Failed to update invoice status:', error);
      toast.error('Failed to update invoice status');
    }
  };

  const handleCopyInvoiceNumber = () => {
    if (invoice?.invoiceNumber) {
      navigator.clipboard.writeText(invoice.invoiceNumber);
      toast.success('Invoice number copied to clipboard');
    }
  };

  const getDaysOverdue = () => {
    if (!invoice?.dueDate || invoice.status === 'PAID') return 0;
    const due = new Date(invoice.dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getPaymentStatus = () => {
    const paidAmount = invoice?.paidAmount || 0;
    const totalAmount = invoice?.totalAmount || 0;
    
    if (paidAmount >= totalAmount) return 'Fully Paid';
    if (paidAmount > 0) return 'Partially Paid';
    return 'Unpaid';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-none h-8 w-8 border-b-2 border-foreground mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">Invoice not found</h3>
        <p className="text-muted-foreground mb-4">The invoice you're looking for doesn't exist.</p>
        <Button onClick={() => router.push('/invoices')} className="rounded-none">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </Button>
      </div>
    );
  }

  const statusInfo = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.DRAFT;
  const daysOverdue = getDaysOverdue();

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="border-b border-border pb-6">
        <div className="flex items-start justify-between mb-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/invoices')}
            className="rounded-none"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
          
          <div className="flex items-center gap-2">
            <Button onClick={handleDownloadPDF} variant="outline" className="rounded-none">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-none">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-none">
                <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Invoice
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyInvoiceNumber}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Invoice Number
                </DropdownMenuItem>
                {invoice.status === 'DRAFT' && (
                  <DropdownMenuItem onClick={() => handleStatusUpdate('SENT')}>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invoice
                  </DropdownMenuItem>
                )}
                {invoice.status === 'SENT' && (
                  <DropdownMenuItem onClick={() => handleStatusUpdate('PAID')}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Paid
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold font-mono tracking-tight">
              {invoice.invoiceNumber}
            </h1>
            <Badge className={`${statusInfo.color} rounded-none`}>
              <statusInfo.icon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
            {daysOverdue > 0 && (
              <Badge variant="destructive" className="rounded-none">
                {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div>
              <div className="text-muted-foreground">Date Issued</div>
              <div className="font-medium">{formatDate(invoice.dateIssued)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Due Date</div>
              <div className="font-medium">{formatDate(invoice.dueDate)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Total Amount</div>
              <div className="font-bold text-lg">{formatCurrency(invoice.totalAmount)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Payment Status</div>
              <div className="font-medium">{getPaymentStatus()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Alert */}
      {daysOverdue > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-none">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h4 className="font-semibold text-red-800">Payment Overdue</h4>
              <p className="text-red-700">
                This invoice is {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue. 
                Payment was due on {formatDate(invoice.dueDate)}.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Client & Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="h-5 w-5" />
                Bill To
              </div>
              <div className="pl-7 space-y-2">
                <div className="font-semibold text-xl">{invoice.client?.name}</div>
                {invoice.client?.company && (
                  <div className="text-muted-foreground">{invoice.client.company}</div>
                )}
                {invoice.client?.email && (
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2" />
                    <a href={`mailto:${invoice.client.email}`} className="hover:text-foreground">
                      {invoice.client.email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <FileText className="h-5 w-5" />
                Project Details
              </div>
              <div className="pl-7 space-y-2">
                <div className="font-semibold">{invoice.project?.title}</div>
                <div className="text-sm text-muted-foreground">Project ID: {invoice.projectId}</div>
                {invoice.terms && (
                  <div className="mt-3">
                    <div className="text-sm font-medium">Terms</div>
                    <div className="text-sm text-muted-foreground">{invoice.terms}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Invoice Items</h2>
              <Badge variant="outline" className="rounded-none">
                {invoice.lineItems?.length || 0} {(invoice.lineItems?.length || 0) === 1 ? 'item' : 'items'}
              </Badge>
            </div>
            
            <div className="border border-border rounded-none overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="text-right font-semibold">Qty</TableHead>
                    <TableHead className="text-right font-semibold">Unit Price</TableHead>
                    <TableHead className="text-right font-semibold">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.lineItems?.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium">{item.description}</div>
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.totalPrice)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Totals Section */}
              <div className="bg-muted/25 p-6 border-t">
                <div className="max-w-sm ml-auto space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {invoice.taxRate && invoice.taxRate > 0 && (
                    <div className="flex justify-between">
                      <span>Tax ({invoice.taxRate}%):</span>
                      <span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(invoice.totalAmount)}</span>
                  </div>
                  {invoice.paidAmount && invoice.paidAmount > 0 && (
                    <>
                      <div className="flex justify-between text-emerald-600">
                        <span>Amount Paid:</span>
                        <span className="font-medium">-{formatCurrency(invoice.paidAmount)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-amber-600">
                        <span>Balance Due:</span>
                        <span>{formatCurrency((invoice.totalAmount || 0) - (invoice.paidAmount || 0))}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Notes</h2>
              <div className="bg-muted/25 p-6 rounded-none border">
                <p className="text-muted-foreground leading-relaxed">{invoice.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Actions</h3>
            <div className="space-y-2">
              {invoice.status === 'DRAFT' && (
                <Button
                  onClick={() => handleStatusUpdate('SENT')}
                  className="w-full rounded-none"
                  variant="outline"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Invoice
                </Button>
              )}
              {invoice.status === 'SENT' && (
                <Button
                  onClick={() => handleStatusUpdate('PAID')}
                  className="w-full rounded-none"
                  variant="outline"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Paid
                </Button>
              )}
              <Button
                onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
                className="w-full rounded-none"
                variant="outline"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Invoice
              </Button>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Invoice Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice Number:</span>
                <span className="font-mono font-medium">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currency:</span>
                <span className="font-medium">{invoice.currency}</span>
              </div>
              {invoice.sentAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sent At:</span>
                  <span>{formatDate(invoice.sentAt)}</span>
                </div>
              )}
              {invoice.paidAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid At:</span>
                  <span>{formatDate(invoice.paidAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <h3 className="font-semibold">Payment History</h3>
              </div>
              <div className="space-y-3">
                {invoice.payments.map((payment, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted/25 rounded-none">
                    <div>
                      <div className="font-medium">{formatCurrency(payment.amount)}</div>
                      <div className="text-sm text-muted-foreground">{payment.method}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(payment.date)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 