"use client";

import { formatCurrency } from "@/lib/constants";

interface PreviewData {
  invoiceNumber: string;
  date: Date;
  customer: {
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    pin?: string | null;
    gstNumber?: string | null;
  } | null;
  items: {
    itemName: string;
    itemSku: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  discountAmount: number;
  shippingCharge: number;
  packagingCharge: number;
  miscCharge: number;
  grandTotal: number;
  paymentStatus: string;
  paymentMethod: string;
  notes: string;
}

const STATUS_STYLES: Record<string, string> = {
  Paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Pending: "bg-amber-100 text-amber-800 border-amber-200",
  Partial: "bg-blue-100 text-blue-800 border-blue-200",
  Draft: "bg-slate-100 text-slate-600 border-slate-200",
  Cancelled: "bg-red-100 text-red-800 border-red-200",
};

export function InvoicePreview({ data }: { data: PreviewData }) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden text-foreground">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight">NB57&apos;s Nostalgia</h2>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice</p>
            <p className="text-sm font-mono font-semibold mt-0.5">{data.invoiceNumber}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {new Date(data.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Bill To */}
      {data.customer && (
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Bill To</p>
          <p className="text-sm font-semibold">{data.customer.name}</p>
          {data.customer.phone && <p className="text-xs text-muted-foreground">{data.customer.phone}</p>}
          {data.customer.email && <p className="text-xs text-muted-foreground">{data.customer.email}</p>}
          {data.customer.address && (
            <p className="text-xs text-muted-foreground mt-1">
              {[data.customer.address, data.customer.city, data.customer.state, data.customer.pin].filter(Boolean).join(", ")}
            </p>
          )}
          {data.customer.gstNumber && (
            <p className="text-xs text-muted-foreground">GST: {data.customer.gstNumber}</p>
          )}
        </div>
      )}

      {/* Items Table */}
      <div className="px-6 py-4">
        {data.items.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">No items added</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 font-medium text-muted-foreground">Item</th>
                <th className="text-center py-2 font-medium text-muted-foreground w-12">Qty</th>
                <th className="text-right py-2 font-medium text-muted-foreground w-20">Price</th>
                <th className="text-right py-2 font-medium text-muted-foreground w-20">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2">
                    <p className="font-medium text-foreground">{item.itemName}</p>
                    <p className="text-[10px] text-muted-foreground">{item.itemSku}</p>
                  </td>
                  <td className="py-2 text-center tabular-nums">{item.quantity}</td>
                  <td className="py-2 text-right tabular-nums">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2 text-right tabular-nums font-medium">{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Totals */}
      {data.items.length > 0 && (
        <div className="px-6 py-4 border-t border-border bg-muted/10">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums font-medium">{formatCurrency(data.subtotal)}</span>
            </div>
            {data.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span className="tabular-nums">−{formatCurrency(data.discountAmount)}</span>
              </div>
            )}
            {data.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax ({data.taxPercent}%)</span>
                <span className="tabular-nums">{formatCurrency(data.taxAmount)}</span>
              </div>
            )}
            {data.shippingCharge > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="tabular-nums">{formatCurrency(data.shippingCharge)}</span>
              </div>
            )}
            {data.packagingCharge > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Packaging</span>
                <span className="tabular-nums">{formatCurrency(data.packagingCharge)}</span>
              </div>
            )}
            {data.miscCharge > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Misc</span>
                <span className="tabular-nums">{formatCurrency(data.miscCharge)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-border text-sm font-bold">
              <span>Grand Total</span>
              <span className="tabular-nums">{formatCurrency(data.grandTotal)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Status */}
      <div className="px-6 py-3 border-t border-border flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Payment</span>
        <div className="flex items-center gap-2">
          {data.paymentMethod && (
            <span className="text-[10px] text-muted-foreground">{data.paymentMethod}</span>
          )}
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLES[data.paymentStatus] || STATUS_STYLES.Draft}`}>
            {data.paymentStatus}
          </span>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="px-6 py-3 border-t border-border">
          <p className="text-[10px] text-muted-foreground">{data.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border bg-muted/10 text-center">
        <p className="text-[9px] text-muted-foreground">Thank you for your purchase from NB57&apos;s Nostalgia</p>
      </div>
    </div>
  );
}
