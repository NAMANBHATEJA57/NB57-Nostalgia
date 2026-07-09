import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { InvoiceDetail } from "@/components/admin/invoice/InvoiceDetail";

export const dynamic = "force-dynamic";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      items: {
        include: {
          item: {
            select: {
              id: true,
              coverImage: true,
              purchasePrice: true,
              askingPrice: true,
            },
          },
        },
      },
      timeline: {
        orderBy: { timestamp: "desc" },
      },
      ledgerEntries: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!invoice) notFound();

  return (
    <div className="flex flex-col min-h-0 h-full">
      <div className="h-14 flex items-center px-8 border-b border-border bg-card flex-shrink-0">
        <h1 className="text-sm font-semibold text-foreground">
          Invoice {invoice.invoiceNumber}
        </h1>
      </div>
      <InvoiceDetail invoice={invoice} />
    </div>
  );
}
