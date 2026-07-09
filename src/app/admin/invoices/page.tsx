import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InvoiceTable } from "@/components/admin/invoice/InvoiceTable";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    include: {
      customer: { select: { name: true, phone: true } },
      items: { select: { itemName: true, quantity: true, totalPrice: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Invoices</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage invoices and payments ({invoices.length} total)
          </p>
        </div>
        <Link href="/admin/invoices/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      <InvoiceTable invoices={invoices} />
    </div>
  );
}
