"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function searchItems(query: string) {
  if (!query || query.length < 2) return [];

  const items = await prisma.item.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { sku: { contains: query, mode: "insensitive" } },
        { character: { contains: query, mode: "insensitive" } },
        { series: { contains: query, mode: "insensitive" } },
        { category: { name: { contains: query, mode: "insensitive" } } },
      ],
      archived: false,
    },
    take: 10,
    select: {
      id: true,
      sku: true,
      name: true,
      condition: true,
      availability: true,
      askingPrice: true,
      fairValueMin: true,
      fairValueMax: true,
      purchasePrice: true,
      coverImage: true,
      quantity: true,
    },
  });

  return items;
}

export async function saveQuote(data: any) {
  try {
    const { id, items, ...quoteData } = data;

    let quote;
    if (id) {
      await prisma.quoteItem.deleteMany({ where: { quoteId: id } });
      quote = await prisma.quote.update({
        where: { id },
        data: {
          ...quoteData,
          items: {
            create: items.map((item: any) => ({
              itemId: item.itemId,
              itemName: item.itemName,
              itemSku: item.itemSku,
              itemCondition: item.itemCondition,
              quantity: item.quantity,
              askingPrice: item.askingPrice,
              sellingPrice: item.sellingPrice,
            })),
          },
        },
      });
    } else {
      quote = await prisma.quote.create({
        data: {
          ...quoteData,
          items: {
            create: items.map((item: any) => ({
              itemId: item.itemId,
              itemName: item.itemName,
              itemSku: item.itemSku,
              itemCondition: item.itemCondition,
              quantity: item.quantity,
              askingPrice: item.askingPrice,
              sellingPrice: item.sellingPrice,
            })),
          },
        },
      });
    }

    revalidatePath("/admin/calculator");
    revalidatePath("/admin/calculator/saved");
    return { success: true, quoteId: quote.id };
  } catch (error) {
    console.error("Error saving quote:", error);
    return { success: false, error: "Failed to save quote" };
  }
}

export async function searchCustomers(query: string) {
  if (!query || query.length < 2) return [];

  const customers = await prisma.customer.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { phone: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { city: { contains: query, mode: "insensitive" } },
      ],
    },
    take: 10,
    include: {
      _count: {
        select: { invoices: true }
      },
      invoices: {
        select: { grandTotal: true },
        where: { paymentStatus: "Paid" } // Assuming lifetime spend is paid invoices
      }
    }
  });

  return customers.map(c => {
    const lifetimeSpend = c.invoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      city: c.city,
      invoicesCount: c._count.invoices,
      lifetimeSpend
    };
  });
}

export async function createCustomer(data: any) {
  try {
    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country || "India",
        pin: data.pin,
        notes: data.notes
      }
    });
    return { success: true, customer };
  } catch (error) {
    console.error("Error creating customer:", error);
    return { success: false, error: "Failed to create customer" };
  }
}

export async function updateCustomer(id: string, data: any) {
  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country || "India",
        pin: data.pin,
        notes: data.notes
      }
    });
    return { success: true, customer };
  } catch (error) {
    console.error("Error updating customer:", error);
    return { success: false, error: "Failed to update customer" };
  }
}

export async function convertToInvoice(quoteId: string, customerId: string) {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { items: true },
    });

    if (!quote) throw new Error("Quote not found");
    if (!customerId) throw new Error("Customer ID is required to convert to invoice.");

    const invoiceNumber = `NB57-INV-${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2,'0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentStatus = quote.advancePaid >= quote.grandTotal && quote.grandTotal > 0 ? "Paid" : (quote.advancePaid > 0 ? "Partial" : "Draft");

    const result = await prisma.$transaction(async (tx) => {
      // Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId,
          subtotal: quote.subtotal,
          discountPercent: quote.discountPercent,
          discountAmount: quote.discountAmount,
          shippingCharge: quote.shippingCharge,
          packagingCharge: quote.packagingCharge,
          miscCharge: quote.miscCharge,
          grandTotal: quote.grandTotal,
          amountPaid: quote.advancePaid,
          paymentStatus: paymentStatus,
          notes: quote.notes,
          items: {
            create: quote.items.map((item) => ({
              itemId: item.itemId,
              itemName: item.itemName,
              itemSku: item.itemSku,
              itemCondition: item.itemCondition,
              quantity: item.quantity,
              unitPrice: item.sellingPrice,
              totalPrice: item.sellingPrice * item.quantity,
            })),
          },
          timeline: {
            create: {
              event: "Created from Quote",
              notes: `Converted from Quote ${quote.title || quote.id}`,
              admin: "System",
            }
          }
        },
      });

      // Update Item Availabilities
      if (invoice.paymentStatus === "Paid") {
        for (const item of quote.items) {
          await tx.item.update({
            where: { id: item.itemId },
            data: {
              availability: "Sold",
              soldPrice: item.sellingPrice,
              soldDate: new Date(),
            },
          });
        }
      } else if (["Draft", "Partial", "Pending"].includes(invoice.paymentStatus)) {
        for (const item of quote.items) {
          await tx.item.update({
            where: { id: item.itemId },
            data: {
              availability: "Reserved",
            },
          });
        }
      }

      // Update Quote Status
      await tx.quote.update({
        where: { id: quoteId },
        data: { 
          status: "Converted",
          invoiceId: invoice.id,
          convertedDate: new Date(),
          convertedBy: "System", // Ideally get admin name from session
        },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          action: "Converted to Invoice",
          entity: "Quote",
          entityId: quote.id,
          details: JSON.stringify({ invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber }),
          admin: "System"
        }
      });

      return invoice;
    });

    revalidatePath("/admin/calculator");
    revalidatePath("/admin/invoices");
    revalidatePath("/");
    revalidatePath("/collection", "layout");

    return { success: true, invoiceId: result.id };
  } catch (error) {
    console.error("Error converting to invoice:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateQuoteStatus(quoteId: string, action: "keep" | "mark" | "delete") {
  try {
    if (action === "delete") {
      await prisma.quote.delete({ where: { id: quoteId } });
    } else if (action === "mark") {
      // Already marked as converted by convertToInvoice, but ensure it's set
      await prisma.quote.update({
        where: { id: quoteId },
        data: { status: "Converted" }
      });
    } else if (action === "keep") {
      // Usually keeping means it remains as is, but maybe status should be changed?
      // Leaving it alone is fine.
    }
    
    revalidatePath("/admin/calculator");
    return { success: true };
  } catch (error) {
    console.error("Error updating quote status:", error);
    return { success: false, error: "Failed to update quote status" };
  }
}

export async function deleteQuote(id: string) {
  try {
    await prisma.quote.delete({ where: { id } });
    revalidatePath("/admin/calculator");
    return { success: true };
  } catch (error) {
    console.error("Error deleting quote:", error);
    return { success: false, error: "Failed to delete quote" };
  }
}
