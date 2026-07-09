import Link from "next/link";
import { ArrowRight, AlertTriangle } from "lucide-react";

interface ReservationRow {
  id: string;
  customerName: string | null;
  expiryDate: Date;
  status: string;
  deposit: number;
  item: { name: string; sku: string; coverImage: string };
  customer: { name: string } | null;
}

export function ReservationsWidget({ reservations }: { reservations: ReservationRow[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Expiring Reservations</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Reservations expiring soon</p>
        </div>
        <Link
          href="/admin/reservations"
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {reservations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs text-muted-foreground">No reservations expiring soon</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservations.map((res) => {
            const name = res.customer?.name || res.customerName || "Unknown";
            const expiresIn = Math.max(0, Math.round((new Date(res.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60)));
            const isUrgent = expiresIn <= 12;

            return (
              <Link
                key={res.id}
                href={`/admin/reservations/${res.id}`}
                className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors -mx-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{res.item.name}</p>
                  <p className="text-xs text-muted-foreground">{name} · {res.item.sku}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isUrgent && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                  <span className={`text-xs font-medium ${isUrgent ? "text-amber-600" : "text-muted-foreground"}`}>
                    {expiresIn > 0 ? `${expiresIn}h left` : "Expired"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
