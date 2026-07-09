import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LiveSummaryCardProps {
  itemsCount: number;
  subtotal: number;
  discountAmount: number;
  shippingCharge: number;
  packagingCharge: number;
  miscCharge: number;
  grandTotal: number;
  purchaseCost: number;
  onSaveQuote: () => void;
  onConvertToInvoice: () => void;
  onReset: () => void;
  onPrintQuote: () => void;
  isSaving: boolean;
  quoteStatus?: string;
  invoiceId?: string;
}

export function LiveSummaryCard({
  itemsCount,
  subtotal,
  discountAmount,
  shippingCharge,
  packagingCharge,
  miscCharge,
  grandTotal,
  purchaseCost,
  onSaveQuote,
  onConvertToInvoice,
  onReset,
  onPrintQuote,
  isSaving,
  quoteStatus,
  invoiceId,
}: LiveSummaryCardProps) {
  const grossProfit = grandTotal - (purchaseCost + shippingCharge + packagingCharge + miscCharge);
  const netProfit = grossProfit; // Can subtract other costs if needed
  const profitMargin = grandTotal > 0 ? (netProfit / grandTotal) * 100 : 0;

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Live Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Items ({itemsCount})</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-red-500">
              <span>Discount</span>
              <span>-₹{discountAmount.toFixed(2)}</span>
            </div>
          )}
          {shippingCharge > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>₹{shippingCharge.toFixed(2)}</span>
            </div>
          )}
          {packagingCharge > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Packaging</span>
              <span>₹{packagingCharge.toFixed(2)}</span>
            </div>
          )}
          {miscCharge > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Other Charges</span>
              <span>₹{miscCharge.toFixed(2)}</span>
            </div>
          )}
          <div className="pt-4 border-t flex justify-between font-bold text-lg">
            <span>Grand Total</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Profit Calculator (Admin Only) */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
          <div className="font-semibold mb-2">Profit Analyzer</div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Purchase Cost</span>
            <span>₹{purchaseCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium text-green-600 dark:text-green-400">
            <span>Net Profit</span>
            <span>₹{netProfit.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium text-blue-600 dark:text-blue-400">
            <span>Margin %</span>
            <span>{profitMargin.toFixed(1)}%</span>
          </div>
        </div>

        <div className="space-y-2 pt-4">
          {quoteStatus === "Converted" ? (
            <div className="space-y-2">
              <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-center font-medium text-sm flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                Converted to Invoice
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full" onClick={() => window.location.href = `/admin/invoices/${invoiceId}`}>
                  View Invoice
                </Button>
                <Button variant="outline" className="w-full" onClick={onReset}>
                  New Calculation
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm" onClick={onConvertToInvoice} disabled={isSaving}>
                Convert to Invoice (Ctrl+I)
              </Button>
              <Button variant="secondary" className="w-full" onClick={onSaveQuote} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Calculation (Ctrl+S)"}
              </Button>
            </>
          )}
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onPrintQuote}>Print (Ctrl+P)</Button>
            <Button variant="outline" onClick={onReset}>Reset (Esc)</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
