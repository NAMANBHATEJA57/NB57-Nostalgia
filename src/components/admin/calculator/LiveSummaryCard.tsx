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
          <Button className="w-full" onClick={onSaveQuote} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Calculation (Ctrl+S)"}
          </Button>
          <Button variant="secondary" className="w-full" onClick={onConvertToInvoice} disabled={isSaving}>
            Convert to Invoice (Ctrl+I)
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onPrintQuote}>Print (Ctrl+P)</Button>
            <Button variant="outline" onClick={onReset}>Reset (Esc)</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
