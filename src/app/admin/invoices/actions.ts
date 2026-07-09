'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { verifySession } from '@/lib/session';
import { generateInvoiceNumber } from '@/lib/constants';
import { logActivity, logInvoiceTimeline, createLedgerEntries, reverseLedgerEntries } from '@/lib/activity';

// ─── Create Invoice ─────────────────────────────────────────

export async function createInvoice(data: {
  customerId?: string | null;
  customerData?: {
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string;
    pin?: string | null;
    gstNumber?: string | null;
  };
  items: {
    itemId: string;
    itemName: string;
    itemSku: string;
    itemCondition?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  taxPercent?: number | null;
  taxAmount: number;
  discountPercent?: number | null;
  discountAmount: number;
  shippingCharge: number;
  packagingCharge: number;
  miscCharge: number;
  grandTotal: number;
  paymentMethod?: string | null;
  paymentStatus: string;
  amountPaid: number;
  notes?: string | null;
}) {
  const session = await verifySession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    // Generate invoice number
    const existingNumbers = await prisma.invoice.findMany({
      select: { invoiceNumber: true },
    });
    const invoiceNumber = generateInvoiceNumber(existingNumbers.map((e) => e.invoiceNumber));

    // Get purchase prices for profit calc
    const itemIds = data.items.map((i) => i.itemId);
    const itemRecords = await prisma.item.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, purchasePrice: true },
    });
    const purchasePriceMap = new Map(itemRecords.map(i => [i.id, i.purchasePrice || 0]));
    const totalPurchasePrice = data.items.reduce((sum, item) => sum + (purchasePriceMap.get(item.itemId) || 0) * item.quantity, 0);

    // Create invoice, customer, items, and ledger in a single transaction
    const invoice = await prisma.$transaction(async (tx) => {
      
      let resolvedCustomerId = data.customerId;
      
      // If customer doesn't exist, create it
      if (!resolvedCustomerId && data.customerData) {
        // Try to find by email or phone first if provided
        let existingCustomer = null;
        if (data.customerData.email || data.customerData.phone) {
          existingCustomer = await tx.customer.findFirst({
            where: {
              OR: [
                ...(data.customerData.email ? [{ email: data.customerData.email }] : []),
                ...(data.customerData.phone ? [{ phone: data.customerData.phone }] : [])
              ]
            }
          });
        }
        
        if (existingCustomer) {
          resolvedCustomerId = existingCustomer.id;
        } else {
          const newCustomer = await tx.customer.create({
            data: {
              name: data.customerData.name,
              phone: data.customerData.phone || null,
              email: data.customerData.email || null,
              address: data.customerData.address || null,
              city: data.customerData.city || null,
              state: data.customerData.state || null,
              country: data.customerData.country || "India",
              pin: data.customerData.pin || null,
              gstNumber: data.customerData.gstNumber || null,
            }
          });
          resolvedCustomerId = newCustomer.id;
        }
      }

      if (!resolvedCustomerId) throw new Error("Customer information is required");

      // Create the invoice
      const inv = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId: resolvedCustomerId,
          subtotal: data.subtotal,
          taxPercent: data.taxPercent || null,
          taxAmount: data.taxAmount,
          discountPercent: data.discountPercent || null,
          discountAmount: data.discountAmount,
          shippingCharge: data.shippingCharge,
          packagingCharge: data.packagingCharge,
          miscCharge: data.miscCharge,
          grandTotal: data.grandTotal,
          paymentMethod: data.paymentMethod || null,
          paymentStatus: data.paymentStatus,
          amountPaid: data.amountPaid,
          notes: data.notes || null,
          items: {
            create: data.items.map((item) => ({
              itemId: item.itemId,
              itemName: item.itemName,
              itemSku: item.itemSku,
              itemCondition: item.itemCondition || null,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
            })),
          },
        },
        include: { items: true, customer: true },
      });

      // Update item availability to Sold if payment is complete
      if (data.paymentStatus === "Paid") {
        for (const item of data.items) {
          await tx.item.update({
            where: { id: item.itemId },
            data: {
              availability: "Sold",
              soldPrice: item.unitPrice,
              soldDate: new Date(),
            },
          });
        }
      } else if (["Draft", "Partial", "Pending"].includes(data.paymentStatus)) {
        for (const item of data.items) {
          await tx.item.update({
            where: { id: item.itemId },
            data: {
              availability: "Reserved",
            },
          });
        }
      }

      // Log timeline
      await logInvoiceTimeline({
        invoiceId: inv.id,
        event: "Created",
        notes: `Invoice ${invoiceNumber} created for ${inv.customer.name}`,
        tx,
      });

      // Create ledger entries
      await createLedgerEntries({
        invoiceId: inv.id,
        revenue: data.grandTotal,
        inventoryCost: totalPurchasePrice,
        shippingCharge: data.shippingCharge,
        packagingCharge: data.packagingCharge,
        miscCharge: data.miscCharge,
        tx,
      });

      // Log activity
      await logActivity({
        action: "Created",
        entity: "Invoice",
        entityId: inv.id,
        details: { invoiceNumber, customer: inv.customer.name, total: data.grandTotal },
        tx,
      });

      return inv;
    });

    revalidatePath('/admin/invoices');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/ledger');
    revalidatePath('/admin/profit');
    revalidatePath('/admin/customers');
    revalidatePath('/');
    revalidatePath('/collection', 'layout');

    return { success: true, invoice };
  } catch (error: any) {
    console.error('Failed to create invoice:', error);
    return { success: false, error: error?.message || 'Failed to create invoice' };
  }
}

// ─── Update Invoice ─────────────────────────────────────────

export async function updateInvoice(
  invoiceId: string,
  data: {
    subtotal: number;
    taxPercent?: number | null;
    taxAmount: number;
    discountPercent?: number | null;
    discountAmount: number;
    shippingCharge: number;
    packagingCharge: number;
    miscCharge: number;
    grandTotal: number;
    paymentMethod?: string | null;
    paymentStatus: string;
    amountPaid: number;
    notes?: string | null;
    trackingNumber?: string | null;
    courierName?: string | null;
  }
) {
  const session = await verifySession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        subtotal: data.subtotal,
        taxPercent: data.taxPercent || null,
        taxAmount: data.taxAmount,
        discountPercent: data.discountPercent || null,
        discountAmount: data.discountAmount,
        shippingCharge: data.shippingCharge,
        packagingCharge: data.packagingCharge,
        miscCharge: data.miscCharge,
        grandTotal: data.grandTotal,
        paymentMethod: data.paymentMethod || null,
        paymentStatus: data.paymentStatus,
        amountPaid: data.amountPaid,
        notes: data.notes || null,
        trackingNumber: data.trackingNumber || null,
        courierName: data.courierName || null,
      },
      include: { items: true },
    });

    if (data.paymentStatus === "Paid") {
      for (const item of invoice.items) {
        await prisma.item.update({
          where: { id: item.itemId },
          data: {
            availability: "Sold",
            soldPrice: item.unitPrice,
            soldDate: new Date(),
          },
        });
      }
    } else if (["Draft", "Partial", "Pending"].includes(data.paymentStatus)) {
      for (const item of invoice.items) {
        await prisma.item.update({
          where: { id: item.itemId },
          data: {
            availability: "Reserved",
          },
        });
      }
    } else if (data.paymentStatus === "Cancelled") {
      for (const item of invoice.items) {
        await prisma.item.update({
          where: { id: item.itemId },
          data: {
            availability: "Available",
          },
        });
      }
    }

    await logInvoiceTimeline({
      invoiceId,
      event: "Edited",
      notes: `Invoice updated`,
    });

    await logActivity({
      action: "Updated",
      entity: "Invoice",
      entityId: invoiceId,
    });

    revalidatePath('/admin/invoices');
    revalidatePath(`/admin/invoices/${invoiceId}`);
    revalidatePath('/admin/dashboard');
    revalidatePath('/');
    revalidatePath('/collection', 'layout');

    return { success: true, invoice };
  } catch (error) {
    console.error('Failed to update invoice:', error);
    return { success: false, error: 'Failed to update invoice' };
  }
}

// ─── Update Payment Status ──────────────────────────────────

export async function updatePaymentStatus(invoiceId: string, status: string, amountPaid?: number) {
  const session = await verifySession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentStatus: status,
        ...(amountPaid !== undefined ? { amountPaid } : {}),
      },
      include: { items: true },
    });

    // If paid, mark items as sold
    if (status === "Paid") {
      for (const item of invoice.items) {
        await prisma.item.update({
          where: { id: item.itemId },
          data: {
            availability: "Sold",
            soldPrice: item.unitPrice,
            soldDate: new Date(),
          },
        });
      }
    } else if (["Draft", "Partial", "Pending"].includes(status)) {
      for (const item of invoice.items) {
        await prisma.item.update({
          where: { id: item.itemId },
          data: {
            availability: "Reserved",
          },
        });
      }
    } else if (status === "Cancelled") {
      for (const item of invoice.items) {
        await prisma.item.update({
          where: { id: item.itemId },
          data: {
            availability: "Available",
          },
        });
      }
    }

    await logInvoiceTimeline({
      invoiceId,
      event: status === "Paid" ? "Paid" : "Edited",
      notes: `Payment status changed to ${status}`,
    });

    revalidatePath('/admin/invoices');
    revalidatePath(`/admin/invoices/${invoiceId}`);
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/items');
    revalidatePath('/');
    revalidatePath('/collection', 'layout');

    return { success: true };
  } catch (error) {
    console.error('Failed to update payment status:', error);
    return { success: false, error: 'Failed to update payment status' };
  }
}

// ─── Delete Invoice (with full reversal) ────────────────────

export async function deleteInvoice(invoiceId: string) {
  const session = await verifySession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
        include: { items: true, customer: true },
      });

      if (!invoice) throw new Error('Invoice not found');

      // Log deletion timeline BEFORE deleting
      await logActivity({
        action: "Deleted",
        entity: "Invoice",
        entityId: invoiceId,
        details: {
          invoiceNumber: invoice.invoiceNumber,
          customer: invoice.customer.name,
          total: invoice.grandTotal,
          items: invoice.items.map((i) => ({ name: i.itemName, sku: i.itemSku, price: i.unitPrice })),
        },
        tx,
      });

      // 1. Restore item availability
      for (const item of invoice.items) {
        await tx.item.update({
          where: { id: item.itemId },
          data: {
            availability: "Available",
            soldPrice: null,
            soldDate: null,
          },
        });
      }

      // 2. Reverse all ledger entries
      await reverseLedgerEntries(invoiceId, tx);

      // 3. Delete the invoice
      await tx.invoice.delete({ where: { id: invoiceId } });
    });

    revalidatePath('/admin/invoices');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/items');
    revalidatePath('/admin/ledger');
    revalidatePath('/admin/profit');
    revalidatePath('/');
    revalidatePath('/collection', 'layout');

    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete invoice:', error);
    return { success: false, error: error?.message || 'Failed to delete invoice' };
  }
}

// ─── Log Timeline Event ─────────────────────────────────────

export async function addTimelineEvent(invoiceId: string, event: string, notes?: string) {
  const session = await verifySession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    await logInvoiceTimeline({ invoiceId, event, notes });
    revalidatePath(`/admin/invoices/${invoiceId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to add timeline event:', error);
    return { success: false, error: 'Failed to add timeline event' };
  }
}

// ─── Search Items for Invoice ───────────────────────────────

export async function searchItemsForInvoice(query: string) {
  const session = await verifySession();
  if (!session) return { success: false, error: 'Unauthorized', items: [] };

  try {
    const items = await prisma.item.findMany({
      where: {
        AND: [
          { availability: "Available" },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { sku: { contains: query, mode: 'insensitive' } },
              { character: { contains: query, mode: 'insensitive' } },
              { series: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      take: 20,
      select: {
        id: true,
        name: true,
        sku: true,
        coverImage: true,
        askingPrice: true,
        purchasePrice: true,
        condition: true,
        quantity: true,
        category: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });

    return { success: true, items };
  } catch (error) {
    console.error('Failed to search items:', error);
    return { success: false, error: 'Failed to search items', items: [] };
  }
}

// ─── Search/Create Customers ────────────────────────────────

export async function searchCustomers(query: string) {
  const session = await verifySession();
  if (!session) return { success: false, error: 'Unauthorized', customers: [] };

  try {
    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
      orderBy: { name: 'asc' },
    });

    return { success: true, customers };
  } catch (error) {
    console.error('Failed to search customers:', error);
    return { success: false, error: 'Failed to search customers', customers: [] };
  }
}

export async function createCustomer(data: {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string;
  pin?: string | null;
  gstNumber?: string | null;
  notes?: string | null;
}) {
  const session = await verifySession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        country: data.country || "India",
        pin: data.pin || null,
        gstNumber: data.gstNumber || null,
        notes: data.notes || null,
      },
    });

    await logActivity({
      action: "Created",
      entity: "Customer",
      entityId: customer.id,
      details: { name: customer.name },
    });

    revalidatePath('/admin/customers');
    return { success: true, customer };
  } catch (error) {
    console.error('Failed to create customer:', error);
    return { success: false, error: 'Failed to create customer' };
  }
}

// ─── Helpers ────────────────────────────────────────────────

async function getTotalPurchasePrice(itemIds: string[]): Promise<number> {
  const items = await prisma.item.findMany({
    where: { id: { in: itemIds } },
    select: { purchasePrice: true },
  });
  return items.reduce((sum, item) => sum + (item.purchasePrice || 0), 0);
}

// ─── Generate WhatsApp Message ──────────────────────────────

export async function getWhatsAppMessage(invoiceId: string) {
  const session = await verifySession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true },
    });

    if (!invoice) return { success: false, error: 'Invoice not found' };

    const message = `Hello ${invoice.customer.name},

Thank you for purchasing from NB57's Nostalgia.

Invoice: ${invoice.invoiceNumber}
Amount: ₹${invoice.grandTotal.toLocaleString("en-IN")}
Payment Status: ${invoice.paymentStatus}${invoice.trackingNumber ? `\nTracking: ${invoice.trackingNumber}` : ""}

Regards,
NB57's Nostalgia`;

    // Log the WhatsApp share event
    await logInvoiceTimeline({
      invoiceId,
      event: "WhatsAppShared",
      notes: `Message shared to ${invoice.customer.name}`,
    });

    const phone = invoice.customer.phone?.replace(/\D/g, '') || '';
    const whatsappUrl = `https://wa.me/${phone.startsWith('91') ? phone : `91${phone}`}?text=${encodeURIComponent(message)}`;

    return { success: true, message, whatsappUrl, phone };
  } catch (error) {
    console.error('Failed to generate WhatsApp message:', error);
    return { success: false, error: 'Failed to generate message' };
  }
}
