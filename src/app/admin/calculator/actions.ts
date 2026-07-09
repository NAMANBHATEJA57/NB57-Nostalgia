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
    const { items, ...quoteData } = data;

    const quote = await prisma.quote.create({
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

    revalidatePath("/admin/calculator");
    return { success: true, quoteId: quote.id };
  } catch (error) {
    console.error("Error saving quote:", error);
    return { success: false, error: "Failed to save quote" };
  }
}

export async function convertToInvoice(quoteId: string, invoiceNumber: string) {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { items: true },
    });

    if (!quote) throw new Error("Quote not found");

    if (!quote.customerId && (!quote.customerName || !quote.customerPhone)) {
      throw new Error("Customer details are required to convert to invoice.");
    }

    let customerId = quote.customerId;

    // If no existing customer, create one temporarily or link it.
    // Since Invoice requires a customerId, we MUST have a customer record.
    if (!customerId) {
      const newCustomer = await prisma.customer.create({
        data: {
          name: quote.customerName || "Walk-in Customer",
          phone: quote.customerPhone,
        }
      });
      customerId = newCustomer.id;
    }

    // Create Invoice
    const invoice = await prisma.invoice.create({
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
        paymentStatus: quote.advancePaid >= quote.grandTotal ? "Paid" : (quote.advancePaid > 0 ? "Partial" : "Draft"),
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
    if (paymentStatus === "Paid") {
      for (const item of quote.items) {
        await prisma.item.update({
          where: { id: item.itemId },
          data: {
            availability: "Sold",
            soldPrice: item.sellingPrice,
            soldDate: new Date(),
          },
        });
      }
    } else if (["Draft", "Partial", "Pending"].includes(paymentStatus)) {
      for (const item of quote.items) {
        await prisma.item.update({
          where: { id: item.itemId },
          data: {
            availability: "Reserved",
          },
        });
      }
    }

    // Update Quote Status
    await prisma.quote.update({
      where: { id: quoteId },
      data: { status: "Converted" },
    });

    revalidatePath("/admin/calculator");
    revalidatePath("/admin/invoices");
    revalidatePath("/");
    revalidatePath("/collection", "layout");

    return { success: true, invoiceId: invoice.id };
  } catch (error) {
    console.error("Error converting to invoice:", error);
    return { success: false, error: (error as Error).message };
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
