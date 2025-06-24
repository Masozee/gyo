"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInvoices, updateInvoiceStatus, type InvoiceWithRelations } from '@/lib/api/invoices';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Receipt,
  Download,
} from 'lucide-react';

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-red-100 text-red-800',
} as const;

const statusIcons = {
  DRAFT: Clock,
  SENT: Send,
  PAID: CheckCircle,
  OVERDUE: AlertCircle,
  CANCELLED: XCircle,
} as const;

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<InvoiceWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceWithRelations[]>([]);

  // Load invoices using Hono API
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        const invoicesData = await getInvoices();
        setInvoices(invoicesData);
        setFilteredInvoices(invoicesData);
      } catch (error) {
        console.error('Failed to load invoices:', error);
        toast.error('Failed to load invoices');
        // Set empty arrays to prevent undefined errors
        setInvoices([]);
        setFilteredInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, []);

  // Filter invoices based on search term with safety checks
  useEffect(() => {
    if (!invoices) {
      setFilteredInvoices([]);
      return;
    }

    if (searchTerm.trim() === '') {
      setFilteredInvoices(invoices);
    } else {
      const filtered = invoices.filter(invoice =>
        invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.project?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInvoices(filtered);
    }
  }, [searchTerm, invoices]);

  const handleStatusUpdate = async (invoiceId: number, newStatus: string) => {
    try {
      await updateInvoiceStatus(invoiceId, newStatus);
      toast.success('Invoice status updated successfully');
      
      // Update local state
      setInvoices(prev => prev.map(invoice => 
        invoice.id === invoiceId 
          ? { ...invoice, status: newStatus as any }
          : invoice
      ));
    } catch (error) {
      console.error('Failed to update invoice status:', error);
      toast.error('Failed to update invoice status');
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount?: number | null) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusInfo = (status: string) => {
    const Icon = statusIcons[status as keyof typeof statusIcons] || Clock;
    return { Icon, color: statusColors[status as keyof typeof statusColors] };
  };

  const handleDownloadPDF = async (invoiceId: number, invoiceNumber: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`);
      if (!response.ok) throw new Error('Failed to generate PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Invoice-${invoiceNumber}.pdf`;
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

  // Calculate stats with safety checks
  const stats = {
    total: invoices?.length || 0,
    draft: invoices?.filter(inv => inv.status === 'DRAFT').length || 0,
    sent: invoices?.filter(inv => inv.status === 'SENT').length || 0,
    paid: invoices?.filter(inv => inv.status === 'PAID').length || 0,
    overdue: invoices?.filter(inv => inv.status === 'OVERDUE').length || 0,
    totalAmount: invoices?.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0) || 0,
    paidAmount: invoices?.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + (inv.totalAmount || 0), 0) || 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Modern Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">Manage your project invoices and billing</p>
        </div>
        <Button onClick={() => router.push('/invoices/new')} className="rounded-none">
          <Plus className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>

      {/* Compact Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-background border rounded-none p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        
        <div className="bg-background border rounded-none p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Revenue</span>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalAmount)}</div>
        </div>
        
        <div className="bg-background border rounded-none p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Paid</span>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidAmount)}</div>
        </div>
        
        <div className="bg-background border rounded-none p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Outstanding</span>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(stats.totalAmount - stats.paidAmount)}
          </div>
        </div>
      </div>

      {/* Clean Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold text-muted-foreground">{stats.draft}</div>
          <div className="text-sm font-medium text-muted-foreground">Draft</div>
        </div>
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold text-blue-600">{stats.sent}</div>
          <div className="text-sm font-medium text-muted-foreground">Sent</div>
        </div>
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold text-green-600">{stats.paid}</div>
          <div className="text-sm font-medium text-muted-foreground">Paid</div>
        </div>
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold text-orange-600">{stats.overdue}</div>
          <div className="text-sm font-medium text-muted-foreground">Overdue</div>
        </div>
      </div>

      {/* Advanced Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search invoices, clients, projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-none w-full sm:w-80"
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-none">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="rounded-none">
              <AlertCircle className="h-4 w-4 mr-2" />
              Overdue Only
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Showing {filteredInvoices?.length || 0} of {stats.total} invoices
        </div>
      </div>

      {/* Advanced Invoice Table */}
      <div className="bg-background border rounded-none overflow-hidden">
        <div className="px-6 py-4 border-b bg-muted/30">
          <h3 className="text-lg font-semibold">
            All Invoices ({filteredInvoices?.length || 0})
          </h3>
        </div>
        
        {!filteredInvoices || filteredInvoices.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-muted rounded-none flex items-center justify-center mx-auto mb-6">
              <Receipt className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-3">No invoices found</h3>
            <p className="text-muted-foreground mb-8">
              {searchTerm ? 'No invoices match your search criteria. Try adjusting your search terms.' : 'Get started by creating your first invoice to track your project billing.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => router.push('/invoices/new')} className="rounded-none">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Invoice
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b bg-muted/20">
                  <TableHead className="font-bold text-foreground px-6 py-4">Invoice</TableHead>
                  <TableHead className="font-bold text-foreground">Client & Project</TableHead>
                  <TableHead className="font-bold text-foreground">Timeline</TableHead>
                  <TableHead className="font-bold text-foreground text-right">Amount</TableHead>
                  <TableHead className="font-bold text-foreground">Status</TableHead>
                  <TableHead className="font-bold text-foreground text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices?.map((invoice) => {
                  const { Icon, color } = getStatusInfo(invoice.status || 'DRAFT');
                  const isOverdue = invoice.status === 'OVERDUE';
                  const isPaid = invoice.status === 'PAID';
                  
                  return (
                    <TableRow 
                      key={invoice.id} 
                      className={`hover:bg-muted/30 transition-colors border-l-4 ${isOverdue ? 'border-l-red-500' : isPaid ? 'border-l-green-500' : 'border-l-transparent'}`}
                    >
                      <TableCell className="px-6 py-6">
                        <div className="space-y-1">
                          <div className="font-mono font-bold text-lg">{invoice.invoiceNumber}</div>
                          <div className="text-sm text-muted-foreground">
                            Issued {formatDate(invoice.dateIssued)}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-6">
                        <div className="space-y-2">
                          <div className="font-semibold">{invoice.client?.name}</div>
                          {invoice.client?.company && (
                            <div className="text-sm text-muted-foreground">{invoice.client.company}</div>
                          )}
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Receipt className="h-3 w-3" />
                            {invoice.project?.title || 'No project'}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-6">
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Due:</span> {formatDate(invoice.dueDate)}
                          </div>
                          {isOverdue && (
                            <div className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
                              <AlertCircle className="h-3 w-3" />
                              Overdue
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-6 text-right">
                        <div className="text-xl font-bold">{formatCurrency(invoice.totalAmount)}</div>
                      </TableCell>
                      
                      <TableCell className="py-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-none text-sm font-medium ${color}`}>
                          <Icon className="h-4 w-4" />
                          {invoice.status || 'DRAFT'}
                        </div>
                      </TableCell>
                      
                      <TableCell className="py-6">
                        <div className="flex items-center justify-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-none"
                            onClick={() => router.push(`/invoices/${invoice.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-none"
                            onClick={() => window.open(`/api/invoices/${invoice.id}/pdf`, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          
                          {invoice.status === 'DRAFT' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 rounded-none text-blue-600 hover:text-blue-700"
                              onClick={() => handleStatusUpdate(invoice.id, 'SENT')}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {invoice.status === 'SENT' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 rounded-none text-green-600 hover:text-green-700"
                              onClick={() => handleStatusUpdate(invoice.id, 'PAID')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-none">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-none">
                              <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}/edit`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(invoice.invoiceNumber)}>
                                <Receipt className="h-4 w-4 mr-2" />
                                Copy Number
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
} 