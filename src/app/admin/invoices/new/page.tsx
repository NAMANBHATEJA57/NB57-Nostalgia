import { prisma } from "@/lib/prisma";
import { InvoiceFormWrapper } from "@/components/admin/invoice/InvoiceFormWrapper";

export const dynamic = "force-dynamic";

export default async function NewInvoicePage() {
  // Pre-fetch available items and existing customers
  const [availableItems, customers] = await Promise.all([
    prisma.item.findMany({
      where: { availability: "Available" },
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
      orderBy: { name: "asc" },
    }),
    prisma.customer.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        state: true,
        country: true,
        pin: true,
        gstNumber: true,
      },
    }),
  ]);

  return (
    <div className="flex flex-col min-h-0 h-full">
      {/* Top Bar */}
      <div className="h-14 flex items-center px-8 border-b border-border bg-card flex-shrink-0">
        <h1 className="text-sm font-semibold text-foreground">New Invoice</h1>
      </div>

      <InvoiceFormWrapper
        availableItems={availableItems}
        customers={customers}
      />
    </div>
  );
}
