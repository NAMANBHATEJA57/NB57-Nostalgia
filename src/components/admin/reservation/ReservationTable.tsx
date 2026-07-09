"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/constants";
import { cancelReservation, expireReservations } from "@/app/admin/reservations/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Clock, AlertTriangle, RefreshCw } from "lucide-react";

interface ReservationRow {
  id: string;
  customerName: string | null;
  customerPhone: string | null;
  reason: string | null;
  deposit: number;
  status: string;
  reservationDate: Date;
  expiryDate: Date;
  item: { name: string; sku: string; coverImage: string; askingPrice: number | null };
  customer: { name: string; phone: string | null } | null;
}

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Expired: "bg-red-50 text-red-700",
  Converted: "bg-blue-50 text-blue-700",
  Cancelled: "bg-slate-100 text-slate-600",
};

export function ReservationTable({ reservations }: { reservations: ReservationRow[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filtered = reservations.filter((r) => {
    const matchesSearch =
      !search ||
      r.item.name.toLowerCase().includes(search.toLowerCase()) ||
      r.item.sku.toLowerCase().includes(search.toLowerCase()) ||
      (r.customerName || r.customer?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || r.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleCancel = (id: string) => {
    if (!confirm("Cancel this reservation? The item will be made available again.")) return;
    startTransition(async () => {
      const result = await cancelReservation(id);
      if (result.success) {
        toast.success("Reservation cancelled");
        router.refresh();
      } else {
        toast.error(result.error || "Failed");
      }
    });
  };

  const handleExpireAll = () => {
    startTransition(async () => {
      const result = await expireReservations();
      if (result.success) {
        toast.success(`${result.count} reservations expired`);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <div className="flex gap-1">
          {["all", "Active", "Expired", "Converted", "Cancelled"].map((s) => (
            <Button
              key={s}
              variant={filter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(s)}
              className="text-xs h-8"
            >
              {s === "all" ? "All" : s}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={handleExpireAll} disabled={isPending} className="text-xs h-8">
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Check Expired
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No reservations found</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((res) => {
            const name = res.customer?.name || res.customerName || "Unknown";
            const expiresIn = Math.max(0, Math.round((new Date(res.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60)));
            const isExpired = new Date(res.expiryDate) < new Date() && res.status === "Active";

            return (
              <div key={res.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  {res.item.coverImage && (
                    <Image src={res.item.coverImage} alt={res.item.name} width={48} height={48} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{res.item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {res.item.sku} · Reserved by {name}
                  </p>
                  {res.reason && <p className="text-xs text-muted-foreground mt-0.5">Reason: {res.reason}</p>}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {res.deposit > 0 && (
                    <span className="text-xs text-muted-foreground">Deposit: {formatCurrency(res.deposit)}</span>
                  )}
                  <div className="flex items-center gap-1.5">
                    {(isExpired || res.status === "Expired") && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                    {res.status === "Active" && !isExpired && <Clock className="h-3.5 w-3.5 text-amber-500" />}
                    <span className="text-xs text-muted-foreground">
                      {isExpired ? "Expired" : res.status === "Active" ? `${expiresIn}h left` : ""}
                    </span>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[isExpired ? "Expired" : res.status] || ""}`}>
                    {isExpired ? "Expired" : res.status}
                  </span>
                  {res.status === "Active" && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => handleCancel(res.id)} disabled={isPending}>
                      <X className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
