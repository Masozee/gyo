import { db } from '../lib/db-server';
import { invoices, invoiceLineItems, clients, projects } from '../lib/schema';
import { eq } from 'drizzle-orm';
import { generateInvoiceNumber } from '../lib/api/invoices';

async function createSampleInvoices() {
  console.log('Creating sample invoices...');

  try {
    // Get existing clients and projects
    const allClients = await db.select().from(clients).limit(5);
    const allProjects = await db.select().from(projects).limit(5);

    if (allClients.length === 0 || allProjects.length === 0) {
      console.log('Please create clients and projects first before running this script');
      return;
    }

    // Sample invoice data
    const sampleInvoices = [
      {
        projectId: allProjects[0].id,
        clientId: allClients[0].id,
        dateIssued: '2025-01-15',
        dueDate: '2025-02-15',
        status: 'SENT' as const,
        currency: 'USD',
        taxRate: 10,
        notes: 'Thank you for your business!',
        terms: 'Payment due within 30 days.',
        lineItems: [
          {
            description: 'Website Development - Phase 1',
            quantity: 1,
            unitPrice: 5000,
            totalPrice: 5000,
          },
          {
            description: 'UI/UX Design',
            quantity: 40,
            unitPrice: 125,
            totalPrice: 5000,
          },
        ],
      },
      {
        projectId: allProjects[1].id,
        clientId: allClients[1].id,
        dateIssued: '2025-01-10',
        dueDate: '2025-02-10',
        status: 'PAID' as const,
        currency: 'USD',
        taxRate: 8.5,
        notes: 'Mobile app development milestone payment.',
        terms: 'Payment terms: Net 30 days.',
        lineItems: [
          {
            description: 'Mobile App Development',
            quantity: 80,
            unitPrice: 150,
            totalPrice: 12000,
          },
          {
            description: 'Testing & QA',
            quantity: 20,
            unitPrice: 100,
            totalPrice: 2000,
          },
        ],
      },
      {
        projectId: allProjects[2].id,
        clientId: allClients[2].id,
        dateIssued: '2025-01-20',
        dueDate: '2025-02-20',
        status: 'DRAFT' as const,
        currency: 'USD',
        taxRate: 7.5,
        notes: 'E-commerce platform development.',
        terms: 'Payment due upon receipt.',
        lineItems: [
          {
            description: 'E-commerce Platform Setup',
            quantity: 1,
            unitPrice: 8000,
            totalPrice: 8000,
          },
          {
            description: 'Payment Gateway Integration',
            quantity: 1,
            unitPrice: 2000,
            totalPrice: 2000,
          },
          {
            description: 'Product Catalog Setup',
            quantity: 50,
            unitPrice: 50,
            totalPrice: 2500,
          },
        ],
      },
      {
        projectId: allProjects[3] ? allProjects[3].id : allProjects[0].id,
        clientId: allClients[3] ? allClients[3].id : allClients[0].id,
        dateIssued: '2024-12-15',
        dueDate: '2025-01-15',
        status: 'OVERDUE' as const,
        currency: 'USD',
        taxRate: 9,
        notes: 'Marketing website development.',
        terms: 'Late payment fees may apply after due date.',
        lineItems: [
          {
            description: 'Marketing Website Development',
            quantity: 1,
            unitPrice: 3500,
            totalPrice: 3500,
          },
          {
            description: 'SEO Optimization',
            quantity: 1,
            unitPrice: 1500,
            totalPrice: 1500,
          },
        ],
      },
    ];

    for (const invoiceData of sampleInvoices) {
      // Calculate amounts
      const subtotal = invoiceData.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const taxAmount = subtotal * (invoiceData.taxRate / 100);
      const totalAmount = subtotal + taxAmount;

      // Generate invoice number
      const invoiceNumber = await generateInvoiceNumber(invoiceData.clientId);

      // Create invoice
      const [invoice] = await db.insert(invoices).values({
        projectId: invoiceData.projectId,
        clientId: invoiceData.clientId,
        invoiceNumber,
        dateIssued: invoiceData.dateIssued,
        dueDate: invoiceData.dueDate,
        subtotal,
        taxRate: invoiceData.taxRate,
        taxAmount,
        totalAmount,
        paidAmount: invoiceData.status === 'PAID' ? totalAmount : 0,
        currency: invoiceData.currency,
        status: invoiceData.status,
        notes: invoiceData.notes,
        terms: invoiceData.terms,
        sentAt: invoiceData.status !== 'DRAFT' ? invoiceData.dateIssued : null,
        paidAt: invoiceData.status === 'PAID' ? invoiceData.dateIssued : null,
        createdAt: invoiceData.dateIssued,
        updatedAt: new Date(),
      }).returning();

      // Create line items
      for (let i = 0; i < invoiceData.lineItems.length; i++) {
        const item = invoiceData.lineItems[i];
        await db.insert(invoiceLineItems).values({
          invoiceId: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          order: i,
        });
      }

      console.log(`Created invoice: ${invoiceNumber}`);
    }

    console.log('Sample invoices created successfully!');
  } catch (error) {
    console.error('Error creating sample invoices:', error);
  }
}

// Run the script
if (require.main === module) {
  createSampleInvoices().then(() => {
    console.log('Script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

export { createSampleInvoices }; 