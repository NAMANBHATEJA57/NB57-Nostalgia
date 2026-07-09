import Link from "next/link";
import { formatCurrency } from "@/lib/constants";
import { ArrowRight } from "lucide-react";

interface Sale {
  id: string;
  invoiceNumber: string;
  grandTotal: number;
  paymentStatus: string;
  createdAt: Date;
  customer: { name: string };
}

const STATUS_COLORS: Record<string, string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Partial: "bg-blue-50 text-blue-700",
  Draft: "bg-slate-50 text-slate-700",
  Cancelled: "bg-red-50 text-red-700",
};

export function RecentSalesWidget({ sales }: { sales: Sale[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recent Sales</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Latest completed transactions</p>
        </div>
        <Link
          href="/admin/invoices"
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {sales.length === 0 ? (
        <p className="text-xs text-muted-foreground py-8 text-center">No sales yet</p>
      ) : (
        <div className="space-y-3">
          {sales.map((sale) => (
            <Link
              key={sale.id}
              href={`/admin/invoices/${sale.id}`}
              className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors -mx-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{sale.customer.name}</p>
                <p className="text-xs text-muted-foreground">{sale.invoiceNumber}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[sale.paymentStatus] || ""}`}>
                  {sale.paymentStatus}
                </span>
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {formatCurrency(sale.grandTotal)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
