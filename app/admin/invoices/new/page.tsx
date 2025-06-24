"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { InvoiceForm } from '@/components/invoice-form';
import type { InvoiceFormData } from '@/lib/api/invoices';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

function NewInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<Partial<InvoiceFormData> | undefined>(undefined);

  // Handle URL parameters for pre-filling
  useEffect(() => {
    const projectId = searchParams.get('projectId');
    const clientId = searchParams.get('clientId');
    
    if (projectId || clientId) {
      setInitialData({
        projectId: projectId ? parseInt(projectId) : undefined,
        clientId: clientId ? parseInt(clientId) : undefined,
      });
    }
  }, [searchParams]);

  const handleSubmit = async (invoiceData: InvoiceFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });
      
      if (!response.ok) throw new Error('Failed to create invoice');
      
      const data = await response.json();
      toast.success('Invoice created successfully');
      router.push(`/invoices/${data.invoice.id}`);
    } catch (error) {
      console.error('Failed to create invoice:', error);
      toast.error('Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/invoices')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Invoice</h1>
            <p className="text-gray-600">Create a new invoice for your project</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <InvoiceForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewInvoiceContent />
    </Suspense>
  );
} 