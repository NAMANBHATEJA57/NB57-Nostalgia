"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatCurrency, calculateProfit } from "@/lib/constants";
import { InvoicePreview } from "./InvoicePreview";
import { UpiQrCode } from "./UpiQrCode";
import { WhatsAppShare } from "./WhatsAppShare";
import {
  updatePaymentStatus,
  deleteInvoice,
  addTimelineEvent,
} from "@/app/admin/invoices/actions";
import { PDFControls } from "../pdf/PDFControls";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Download,
  MessageCircle,
  Printer,
  Package,
  Tag,
  Clock,
  TrendingUp,
  FileText,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface InvoiceDetailProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    grandTotal: number;
    subtotal: number;
    taxPercent: number | null;
    taxAmount: number;
    discountPercent: number | null;
    discountAmount: number;
    shippingCharge: number;
    packagingCharge: number;
    miscCharge: number;
    paymentMethod: string | null;
    paymentStatus: string;
    amountPaid: number;
    notes: string | null;
    trackingNumber: string | null;
    courierName: string | null;
    createdAt: Date;
    customer: {
      id: string;
      name: string;
      phone: string | null;
      email: string | null;
      address: string | null;
      city: string | null;
      state: string | null;
      country: string | null;
      pin: string | null;
      gstNumber: string | null;
    };
    items: {
      id: string;
      itemName: string;
      itemSku: string;
      itemCondition: string | null;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      item: {
        id: string;
        coverImage: string;
        purchasePrice: number | null;
        askingPrice: number | null;
      };
    }[];
    timeline: {
      id: string;
      event: string;
      admin: string | null;
      notes: string | null;
      timestamp: Date;
    }[];
    ledgerEntries: {
      id: string;
      type: string;
      amount: number;
      description: string;
      reversed: boolean;
      createdAt: Date;
    }[];
  };
}

const TIMELINE_ICONS: Record<string, React.ElementType> = {
  Created: CheckCircle,
  Edited: FileText,
  Paid: TrendingUp,
  Downloaded: Download,
  WhatsAppShared: MessageCircle,
  Packed: Package,
  Shipped: Tag,
  Delivered: CheckCircle,
  Deleted: Trash2,
};

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"preview" | "profit" | "timeline" | "ledger">("preview");

  // Calculate profit
  const totalPurchasePrice = invoice.items.reduce((sum, item) => sum + (item.item.purchasePrice || 0) * item.quantity, 0);
  const profit = calculateProfit({
    sellingPrice: invoice.grandTotal,
    purchasePrice: totalPurchasePrice,
    shippingCost: invoice.shippingCharge,
    packagingCost: invoice.packagingCharge,
    misc: invoice.miscCharge,
  });

  const handleStatusChange = (status: string) => {
    startTransition(async () => {
      const amount = status === "Paid" ? invoice.grandTotal : invoice.amountPaid;
      const result = await updatePaymentStatus(invoice.id, status, amount);
      if (result.success) {
        toast.success(`Payment status updated to ${status}`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`Delete invoice ${invoice.invoiceNumber}? This will restore all items to inventory and reverse all ledger entries.`)) return;
    startTransition(async () => {
      const result = await deleteInvoice(invoice.id);
      if (result.success) {
        toast.success("Invoice deleted and inventory restored");
        router.push("/admin/invoices");
      } else {
        toast.error(result.error || "Failed to delete invoice");
      }
    });
  };

  const handleTimelineEvent = (event: string) => {
    startTransition(async () => {
      await addTimelineEvent(invoice.id, event);
      toast.success(`Marked as ${event}`);
      router.refresh();
    });
  };

  const previewData = {
    invoiceNumber: invoice.invoiceNumber,
    date: invoice.createdAt,
    customer: invoice.customer,
    items: invoice.items,
    subtotal: invoice.subtotal,
    taxPercent: invoice.taxPercent || 0,
    taxAmount: invoice.taxAmount,
    discountAmount: invoice.discountAmount,
    shippingCharge: invoice.shippingCharge,
    packagingCharge: invoice.packagingCharge,
    miscCharge: invoice.miscCharge,
    grandTotal: invoice.grandTotal,
    paymentStatus: invoice.paymentStatus,
    paymentMethod: invoice.paymentMethod || "",
    notes: invoice.notes || "",
  };

  return (
    <div className="flex-1 overflow-hidden flex">
      {/* Left: Details + Actions */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {/* Status + Actions Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">{invoice.invoiceNumber}</h2>
            <StatusBadge status={invoice.paymentStatus} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {invoice.paymentStatus !== "Paid" && (
              <Button size="sm" onClick={() => handleStatusChange("Paid")} disabled={isPending}>
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Mark Paid
              </Button>
            )}
            {invoice.paymentStatus === "Draft" && (
              <Button size="sm" variant="outline" onClick={() => handleStatusChange("Pending")} disabled={isPending}>
                Send
              </Button>
            )}
            <WhatsAppShare invoiceId={invoice.id} />
            <Button size="sm" variant="outline" onClick={() => handleTimelineEvent("Packed")} disabled={isPending}>
              <Package className="h-3.5 w-3.5 mr-1.5" /> Packed
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleTimelineEvent("Shipped")} disabled={isPending}>
              <Tag className="h-3.5 w-3.5 mr-1.5" /> Shipped
            </Button>
            <Button size="sm" variant="outline" className="text-destructive" onClick={handleDelete} disabled={isPending}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          {(["preview", "profit", "timeline", "ledger"] as const).map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "preview" && (
          <div className="max-w-lg space-y-4">
            <PDFControls invoice={invoice} logoUrl="/logo.png" />
            <InvoicePreview data={previewData} />
          </div>
        )}

        {activeTab === "profit" && (
          <div className="max-w-lg space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h3 className="text-sm font-semibold">Profit Breakdown</h3>
              <div className="space-y-2 text-sm">
                <Row label="Selling Price (Grand Total)" value={formatCurrency(invoice.grandTotal)} />
                <Row label="Purchase Price (Cost)" value={formatCurrency(totalPurchasePrice)} />
                <Row label="Shipping Cost" value={formatCurrency(invoice.shippingCharge)} />
                <Row label="Packaging Cost" value={formatCurrency(invoice.packagingCharge)} />
                <Row label="Misc Charges" value={formatCurrency(invoice.miscCharge)} />
                <hr className="border-border" />
                <Row label="Gross Profit" value={formatCurrency(profit.grossProfit)} bold highlight={profit.grossProfit >= 0 ? "green" : "red"} />
                <Row label="Net Profit" value={formatCurrency(profit.netProfit)} bold highlight={profit.netProfit >= 0 ? "green" : "red"} />
                <Row label="Margin" value={`${profit.margin}%`} bold highlight={profit.margin >= 0 ? "green" : "red"} />
              </div>
            </div>

            {/* Per-Item Breakdown */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h3 className="text-sm font-semibold">Per-Item Profit</h3>
              <div className="space-y-3">
                {invoice.items.map((item) => {
                  const itemProfit = item.unitPrice - (item.item.purchasePrice || 0);
                  return (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{item.itemName}</p>
                        <p className="text-xs text-muted-foreground">
                          Cost: {formatCurrency(item.item.purchasePrice || 0)} → Sold: {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <span className={`font-semibold tabular-nums ${itemProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {itemProfit >= 0 ? "+" : ""}{formatCurrency(itemProfit)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="max-w-lg space-y-0">
            {invoice.timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No timeline events</p>
            ) : (
              invoice.timeline.map((event, index) => {
                const Icon = TIMELINE_ICONS[event.event] || Clock;
                const isLast = index === invoice.timeline.length - 1;
                return (
                  <div key={event.id} className="flex gap-3 relative">
                    {!isLast && <div className="absolute left-[13px] top-8 w-px h-[calc(100%-8px)] bg-border" />}
                    <div className="relative z-10 flex-shrink-0 h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium">{event.event}</p>
                      {event.notes && <p className="text-xs text-muted-foreground mt-0.5">{event.notes}</p>}
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {event.admin || "Admin"} · {new Date(event.timestamp).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === "ledger" && (
          <div className="max-w-lg">
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Type</th>
                    <th className="text-right py-2.5 px-4 text-xs font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.ledgerEntries.map((entry) => (
                    <tr key={entry.id} className={`border-b border-border/50 ${entry.reversed ? "opacity-50 line-through" : ""}`}>
                      <td className="py-2 px-4">
                        <span className="text-xs font-medium">{entry.type}</span>
                      </td>
                      <td className={`py-2 px-4 text-right tabular-nums font-medium ${entry.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {entry.amount >= 0 ? "+" : ""}{formatCurrency(entry.amount)}
                      </td>
                      <td className="py-2 px-4 text-xs text-muted-foreground">{entry.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Right: UPI QR */}
      <div className="w-80 flex-shrink-0 overflow-y-auto bg-muted/20 p-6 border-l border-border hidden xl:block">
        <div className="space-y-6">
          <UpiQrCode
            amount={invoice.grandTotal}
            invoiceNumber={invoice.invoiceNumber}
            customerName={invoice.customer.name}
            isPaid={invoice.paymentStatus === "Paid"}
          />

          {/* Quick Info */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-2.5 text-xs">
            <Row label="Customer" value={invoice.customer.name} />
            {invoice.customer.phone && <Row label="Phone" value={invoice.customer.phone} />}
            <Row label="Items" value={`${invoice.items.length}`} />
            <Row label="Created" value={new Date(invoice.createdAt).toLocaleDateString("en-IN")} />
            {invoice.trackingNumber && <Row label="Tracking" value={invoice.trackingNumber} />}
            {invoice.courierName && <Row label="Courier" value={invoice.courierName} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper Components ──────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Paid: "bg-emerald-50 text-emerald-700",
    Pending: "bg-amber-50 text-amber-700",
    Partial: "bg-blue-50 text-blue-700",
    Draft: "bg-slate-100 text-slate-600",
    Cancelled: "bg-red-50 text-red-700",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] || ""}`}>
      {status}
    </span>
  );
}

function Row({
  label,
  value,
  bold,
  highlight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: "green" | "red";
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`tabular-nums ${bold ? "font-semibold" : "font-medium"} ${
          highlight === "green" ? "text-emerald-600" : highlight === "red" ? "text-red-600" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
