import { prisma } from "@/lib/prisma";
import { LedgerTable } from "@/components/admin/ledger/LedgerTable";

export const dynamic = "force-dynamic";

export default async function LedgerPage() {
  const entries = await prisma.ledgerEntry.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      invoice: {
        select: { invoiceNumber: true }
      }
    }
  });

  return (
    <div className="flex flex-col min-h-0 h-full">
      <div className="h-14 flex items-center px-8 border-b border-border bg-card flex-shrink-0">
        <h1 className="text-sm font-semibold text-foreground">Ledger</h1>
      </div>
      <div className="flex-1 overflow-auto p-8 bg-background">
        <LedgerTable entries={entries} />
      </div>
    </div>
  );
}
