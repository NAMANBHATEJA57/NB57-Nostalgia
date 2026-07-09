import { prisma } from "@/lib/prisma";
import { ProfitDashboard } from "@/components/admin/profit/ProfitDashboard";

export const dynamic = "force-dynamic";

export default async function ProfitLossPage() {
  const entries = await prisma.ledgerEntry.findMany({
    orderBy: { createdAt: "desc" },
    select: { type: true, amount: true, createdAt: true, reversed: true }
  });

  return (
    <div className="flex flex-col min-h-0 h-full">
      <div className="h-14 flex items-center px-8 border-b border-border bg-card flex-shrink-0">
        <h1 className="text-sm font-semibold text-foreground">Profit & Loss</h1>
      </div>
      <div className="flex-1 overflow-auto p-8 bg-background">
        <ProfitDashboard entries={entries} />
      </div>
    </div>
  );
}
