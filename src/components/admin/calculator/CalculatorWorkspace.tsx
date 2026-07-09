"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, X, Plus, Trash2, Printer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LiveSummaryCard } from "./LiveSummaryCard";
import { searchItems, saveQuote, convertToInvoice } from "@/app/admin/calculator/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ConvertCalculationModal } from "./ConvertCalculationModal";

interface SelectedItem {
  itemId: string;
  itemName: string;
  itemSku: string;
  itemCondition: string;
  askingPrice: number;
  sellingPrice: number;
  fairValueMin: number;
  fairValueMax: number;
  purchasePrice: number;
  quantity: number;
  coverImage: string;
}

export function CalculatorWorkspace({ initialQuote }: { initialQuote?: any }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>(
    initialQuote?.items.map((item: any) => ({
      itemId: item.itemId,
      itemName: item.itemName,
      itemSku: item.itemSku,
      itemCondition: item.itemCondition,
      askingPrice: item.askingPrice,
      sellingPrice: item.sellingPrice,
      fairValueMin: 0,
      fairValueMax: 0,
      purchasePrice: 0,
      quantity: item.quantity,
      coverImage: "",
    })) || []
  );
  
  const [discountType, setDiscountType] = useState<"percent" | "flat">(initialQuote?.discountPercent ? "percent" : "flat");
  const [discountValue, setDiscountValue] = useState<number>(initialQuote?.discountPercent || initialQuote?.discountAmount || 0);
  const [shippingCharge, setShippingCharge] = useState<number>(initialQuote?.shippingCharge || 0);
  const [packagingCharge, setPackagingCharge] = useState<number>(initialQuote?.packagingCharge || 0);
  const [miscCharge, setMiscCharge] = useState<number>(initialQuote?.miscCharge || 0);
  
  const [customerName, setCustomerName] = useState(initialQuote?.customerName || "");
  const [customerPhone, setCustomerPhone] = useState(initialQuote?.customerPhone || "");
  const [quoteTitle, setQuoteTitle] = useState(initialQuote?.title || "");
  const [notes, setNotes] = useState(initialQuote?.notes || "");
  const [advancePaid, setAdvancePaid] = useState<number>(initialQuote?.advancePaid || 0);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        const data = await searchItems(query);
        setResults(data);
        setIsSearching(false);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleAddItem = (item: any) => {
    if (selectedItems.find((i) => i.itemId === item.id)) {
      toast.error("Item already added");
      return;
    }
    
    setSelectedItems([...selectedItems, {
      itemId: item.id,
      itemName: item.name,
      itemSku: item.sku,
      itemCondition: item.condition,
      askingPrice: item.askingPrice || 0,
      sellingPrice: item.askingPrice || 0,
      fairValueMin: item.fairValueMin || 0,
      fairValueMax: item.fairValueMax || 0,
      purchasePrice: item.purchasePrice || 0,
      quantity: 1,
      coverImage: item.coverImage,
    }]);
    setQuery("");
    setResults([]);
  };

  const updateItem = (id: string, field: keyof SelectedItem, value: any) => {
    setSelectedItems(items => items.map(item => 
      item.itemId === id ? { ...item, [field]: value } : item
    ));
  };

  const removeItem = (id: string) => {
    setSelectedItems(items => items.filter(item => item.itemId !== id));
  };

  const subtotal = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + (item.sellingPrice * item.quantity), 0);
  }, [selectedItems]);

  const discountAmount = useMemo(() => {
    if (discountType === "flat") return discountValue;
    return (subtotal * discountValue) / 100;
  }, [subtotal, discountType, discountValue]);

  const grandTotal = useMemo(() => {
    return subtotal - discountAmount + shippingCharge + packagingCharge + miscCharge;
  }, [subtotal, discountAmount, shippingCharge, packagingCharge, miscCharge]);

  const purchaseCost = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + (item.purchasePrice * item.quantity), 0);
  }, [selectedItems]);

  const itemsCount = selectedItems.reduce((acc, item) => acc + item.quantity, 0);

  const applyQuickDiscount = (val: number, type: "percent" | "flat") => {
    setDiscountType(type);
    setDiscountValue(val);
  };

  const handleSaveQuote = async () => {
    if (selectedItems.length === 0) {
      toast.error("Add at least one item");
      return;
    }
    setIsSaving(true);
    const result = await saveQuote({
      title: quoteTitle,
      customerName,
      customerPhone,
      subtotal,
      discountPercent: discountType === "percent" ? discountValue : null,
      discountAmount,
      shippingCharge,
      packagingCharge,
      miscCharge,
      grandTotal,
      advancePaid,
      notes,
      items: selectedItems,
      ...(initialQuote?.id && { id: initialQuote.id }),
    });
    setIsSaving(false);
    if (result.success) {
      toast.success("Quote saved successfully");
      // Update ID if it's a new quote being saved
      if (!initialQuote?.id && result.quoteId) {
        router.replace(`/admin/calculator/${result.quoteId}`);
      }
    } else {
      toast.error(result.error);
    }
  };

  const handleConvertToInvoice = async () => {
    if (selectedItems.length === 0) {
      toast.error("Add at least one item");
      return;
    }
    
    // Open the conversion modal instead of converting instantly
    setIsConvertModalOpen(true);
  };

  const handleReset = useCallback(() => {
    if (window.confirm("Are you sure you want to reset the calculator?")) {
      setSelectedItems([]);
      setDiscountValue(0);
      setShippingCharge(0);
      setPackagingCharge(0);
      setMiscCharge(0);
      setAdvancePaid(0);
      setCustomerName("");
      setCustomerPhone("");
      setQuoteTitle("");
      setNotes("");
    }
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSaveQuote();
      }
      if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        handleConvertToInvoice();
      }
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        handleReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveQuote, handleConvertToInvoice, handleReset, handlePrint]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6 print:hidden">
        
        {/* Search Section */}
        <div className="bg-card border rounded-xl p-4 shadow-sm relative">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items by Name, SKU, Character, Series..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          {results.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {results.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 hover:bg-muted cursor-pointer"
                  onClick={() => handleAddItem(item)}
                >
                  {item.coverImage && (
                    <Image src={item.coverImage} alt={item.name} width={40} height={40} className="rounded object-cover" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.sku} | {item.condition}</div>
                  </div>
                  <div className="text-sm font-semibold">₹{item.askingPrice}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Items */}
        <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-muted/30">
            <h3 className="font-semibold">Selected Items</h3>
          </div>
          <div className="divide-y">
            {selectedItems.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Search and select items to add them to the calculation.
              </div>
            ) : (
              selectedItems.map((item) => (
                <div key={item.itemId} className="p-4 flex items-start gap-4">
                  {item.coverImage && (
                    <Image src={item.coverImage} alt={item.itemName} width={60} height={60} className="rounded object-cover" />
                  )}
                  <div className="flex-1 space-y-2">
                    <div>
                      <div className="font-medium">{item.itemName}</div>
                      <div className="text-xs text-muted-foreground">Asking: ₹{item.askingPrice} | Fair Value: ₹{item.fairValueMin}-₹{item.fairValueMax}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Selling Price</Label>
                        <Input 
                          type="number" 
                          value={item.sellingPrice} 
                          onChange={(e) => updateItem(item.itemId, 'sellingPrice', Number(e.target.value))}
                          className="w-24 h-8"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Quantity</Label>
                        <Input 
                          type="number" 
                          value={item.quantity} 
                          min={1}
                          onChange={(e) => updateItem(item.itemId, 'quantity', Number(e.target.value))}
                          className="w-20 h-8"
                        />
                      </div>
                      <div className="pt-5">
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.itemId)} className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold mt-6">
                    ₹{(item.sellingPrice * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pricing & Adjustments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 bg-card border rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-sm">Discount & Extra Charges</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Button size="sm" variant={discountType === "flat" ? "default" : "outline"} onClick={() => setDiscountType("flat")}>Flat (₹)</Button>
                <Button size="sm" variant={discountType === "percent" ? "default" : "outline"} onClick={() => setDiscountType("percent")}>Percent (%)</Button>
                <Input 
                  type="number" 
                  value={discountValue} 
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-24 ml-auto"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button size="xs" variant="secondary" onClick={() => applyQuickDiscount(5, "percent")}>5%</Button>
                <Button size="xs" variant="secondary" onClick={() => applyQuickDiscount(10, "percent")}>10%</Button>
                <Button size="xs" variant="secondary" onClick={() => applyQuickDiscount(15, "percent")}>15%</Button>
                <Button size="xs" variant="secondary" onClick={() => applyQuickDiscount(250, "flat")}>₹250</Button>
                <Button size="xs" variant="secondary" onClick={() => applyQuickDiscount(500, "flat")}>₹500</Button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <Label className="text-xs">Shipping Cost</Label>
                  <Input type="number" value={shippingCharge} onChange={(e) => setShippingCharge(Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Packaging Cost</Label>
                  <Input type="number" value={packagingCharge} onChange={(e) => setPackagingCharge(Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Other Charges</Label>
                  <Input type="number" value={miscCharge} onChange={(e) => setMiscCharge(Number(e.target.value))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Advance Paid</Label>
                  <Input type="number" value={advancePaid} onChange={(e) => setAdvancePaid(Number(e.target.value))} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-card border rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-sm">Quote Details</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Quote Title (Optional)</Label>
                <Input value={quoteTitle} onChange={(e) => setQuoteTitle(e.target.value)} placeholder="e.g. Pokemon Bundle" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Customer Name</Label>
                  <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Customer Phone</Label>
                  <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Notes</Label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reason for discount, bundle terms..." />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="print:hidden">
        <LiveSummaryCard
          itemsCount={itemsCount}
          subtotal={subtotal}
          discountAmount={discountAmount}
          shippingCharge={shippingCharge}
          packagingCharge={packagingCharge}
          miscCharge={miscCharge}
          grandTotal={grandTotal}
          purchaseCost={purchaseCost}
          onSaveQuote={handleSaveQuote}
          onConvertToInvoice={handleConvertToInvoice}
          onReset={handleReset}
          onPrintQuote={handlePrint}
          isSaving={isSaving}
          quoteStatus={initialQuote?.status}
          invoiceId={initialQuote?.invoiceId}
        />
      </div>

      <ConvertCalculationModal 
        isOpen={isConvertModalOpen} 
        onClose={() => setIsConvertModalOpen(false)} 
        quoteData={{
          id: initialQuote?.id,
          title: quoteTitle,
          customerName,
          customerPhone,
          subtotal,
          discountPercent: discountType === "percent" ? discountValue : null,
          discountAmount,
          shippingCharge,
          packagingCharge,
          miscCharge,
          grandTotal,
          advancePaid,
          notes,
          items: selectedItems,
        }}
        onSuccess={() => setIsConvertModalOpen(false)}
      />

      {/* Print View Only */}
      <div className="hidden print:block space-y-8">
        <div className="text-center pb-4 border-b">
          <h1 className="text-2xl font-bold uppercase tracking-widest">NB57's Nostalgia</h1>
          <h2 className="text-xl text-muted-foreground mt-2">Quotation</h2>
        </div>
        
        <div className="flex justify-between">
          <div>
            <div className="text-sm font-semibold text-muted-foreground">To:</div>
            <div className="font-medium text-lg">{customerName || "Valued Customer"}</div>
            <div>{customerPhone}</div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-muted-foreground">Date:</div>
            <div>{new Date().toLocaleDateString()}</div>
            {quoteTitle && <div className="mt-2 font-medium">{quoteTitle}</div>}
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Item</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {selectedItems.map((item) => (
              <tr key={item.itemId} className="border-b border-muted">
                <td className="py-3">
                  <div className="font-medium">{item.itemName}</div>
                  <div className="text-sm text-muted-foreground">{item.itemSku} • {item.itemCondition}</div>
                </td>
                <td className="py-3 text-right">{item.quantity}</td>
                <td className="py-3 text-right">₹{item.sellingPrice.toFixed(2)}</td>
                <td className="py-3 text-right">₹{(item.sellingPrice * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end pt-4">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
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
                <span>Shipping</span>
                <span>₹{shippingCharge.toFixed(2)}</span>
              </div>
            )}
            {packagingCharge > 0 && (
              <div className="flex justify-between">
                <span>Packaging</span>
                <span>₹{packagingCharge.toFixed(2)}</span>
              </div>
            )}
            {miscCharge > 0 && (
              <div className="flex justify-between">
                <span>Other Charges</span>
                <span>₹{miscCharge.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Grand Total</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {notes && (
          <div className="pt-8 text-sm">
            <div className="font-semibold text-muted-foreground mb-1">Notes:</div>
            <div>{notes}</div>
          </div>
        )}
        
        <div className="pt-16 text-center text-sm text-muted-foreground">
          This is a quotation and subject to availability.
        </div>
      </div>
    </div>
  );
}
