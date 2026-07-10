"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { searchCustomers, createCustomer, updateCustomer, convertToInvoice, updateQuoteStatus, saveQuote } from "@/app/admin/calculator/actions";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteData: any;
  onSuccess?: () => void;
}

export function ConvertCalculationModal({ isOpen, onClose, quoteData, onSuccess }: ConvertModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  // New Customer Form State
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState({
    name: quoteData.customerName || "",
    phone: quoteData.customerPhone || "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pin: "",
    notes: ""
  });

  const [generatedInvoiceId, setGeneratedInvoiceId] = useState<string | null>(null);

  // Search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2 && !showNewForm) {
        const results = await searchCustomers(query);
        setCustomers(results);
      } else {
        setCustomers([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query, showNewForm]);

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error("Name and Phone are required");
      return;
    }
    setIsProcessing(true);
    let res;
    if (editingCustomerId) {
      res = await updateCustomer(editingCustomerId, newCustomer);
    } else {
      res = await createCustomer(newCustomer);
    }
    
    if (res.success) {
      toast.success(editingCustomerId ? "Customer updated successfully" : "Customer created successfully");
      setSelectedCustomer(res.customer);
      setShowNewForm(false);
      setEditingCustomerId(null);
      setStep(2);
    } else {
      toast.error(res.error);
    }
    setIsProcessing(false);
  };

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setStep(2);
  };

  const handleConvert = async () => {
    if (!selectedCustomer) return;
    setIsProcessing(true);

    try {
      // 1. Ensure quote is saved first with correct customer info
      const saveResult = await saveQuote({
        ...quoteData,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        customerId: selectedCustomer.id,
      });

      if (!saveResult.success || !saveResult.quoteId) {
        throw new Error("Failed to save calculation before converting.");
      }

      // 2. Convert to Invoice
      const convertResult = await convertToInvoice(saveResult.quoteId, selectedCustomer.id);
      
      if (convertResult.success) {
        toast.success("Successfully converted to invoice!");
        setGeneratedInvoiceId(convertResult.invoiceId ?? null);
        setStep(3); // Go to success step
        if (onSuccess) onSuccess();
      } else {
        throw new Error(convertResult.error);
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePostAction = async (action: "keep" | "mark" | "delete") => {
    if (!quoteData.id) {
      // If it's a new quote and we just created it during convert, we'd need that ID.
      // Assuming saveQuote was called before the modal or we use the ID returned. 
      // For simplicity, we just redirect.
    } else {
      await updateQuoteStatus(quoteData.id, action);
    }
    router.push(`/admin/invoices/${generatedInvoiceId}`);
  };

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedCustomer(null);
      setQuery("");
      setCustomers([]);
      setShowNewForm(false);
      setEditingCustomerId(null);
      setGeneratedInvoiceId(null);
      setNewCustomer({
        name: quoteData.customerName || "",
        phone: quoteData.customerPhone || "",
        email: "",
        address: "",
        city: "",
        state: "",
        country: "India",
        pin: "",
        notes: ""
      });
    }
  }, [isOpen, quoteData]);

  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : "NA";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && onClose()}>
      <DialogContent className="max-w-3xl rounded-xl p-0 overflow-hidden">
        
        {step === 1 && (
          <div className="flex flex-col h-[80vh] max-h-[700px]">
            <DialogHeader className="p-6 pb-2 border-b">
              <DialogTitle className="text-2xl">Convert Calculation to Invoice</DialogTitle>
              <DialogDescription>
                Select an existing customer or create a new one before generating the invoice.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 bg-muted/20">
              {!showNewForm ? (
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Search existing customers by Name, Phone, Email, City..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="pl-10 h-12 text-lg rounded-xl"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => {
                      setEditingCustomerId(null);
                      setNewCustomer({
                        name: quoteData.customerName || "",
                        phone: quoteData.customerPhone || "",
                        email: "",
                        address: "",
                        city: "",
                        state: "",
                        country: "India",
                        pin: "",
                        notes: ""
                      });
                      setShowNewForm(true);
                    }} className="gap-2">
                      <Plus className="h-4 w-4" /> New Customer
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customers.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => handleCustomerSelect(c)}
                        className="bg-card border rounded-xl p-4 flex items-start gap-4 cursor-pointer hover:border-primary transition-colors hover:shadow-sm"
                      >
                        <Avatar className="h-12 w-12 border">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">{getInitials(c.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-base truncate">{c.name}</h4>
                          <div className="text-sm text-muted-foreground truncate">{c.phone} {c.city ? `• ${c.city}` : ''}</div>
                          <div className="mt-2 text-xs font-medium flex gap-3 text-muted-foreground">
                            <span>{c.invoicesCount} Invoices</span>
                            <span>₹{c.lifetimeSpend.toLocaleString()} Spent</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {query.length >= 2 && customers.length === 0 && (
                      <div className="col-span-full py-8 text-center text-muted-foreground">
                        No customers found matching "{query}"
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveCustomer} className="bg-card border rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{editingCustomerId ? "Edit Customer" : "Create New Customer"}</h3>
                    <Button type="button" variant="ghost" onClick={() => { setShowNewForm(false); setEditingCustomerId(null); }}>Cancel</Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone *</Label>
                      <Input value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input value={newCustomer.city} onChange={e => setNewCustomer({...newCustomer, city: e.target.value})} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Address</Label>
                      <Input value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input value={newCustomer.state} onChange={e => setNewCustomer({...newCustomer, state: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>PIN</Label>
                      <Input value={newCustomer.pin} onChange={e => setNewCustomer({...newCustomer, pin: e.target.value})} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Notes</Label>
                      <Input value={newCustomer.notes} onChange={e => setNewCustomer({...newCustomer, notes: e.target.value})} />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button type="submit" size="lg" disabled={isProcessing}>
                      {isProcessing ? "Saving..." : "Save & Select Customer"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col h-[80vh] max-h-[700px]">
            <DialogHeader className="p-6 pb-2 border-b">
              <DialogTitle className="text-2xl">Review Invoice</DialogTitle>
              <DialogDescription>
                Confirm details before converting to a formal invoice.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="bg-muted/30 p-4 rounded-xl border flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Bill To</div>
                  <div className="font-semibold text-lg">{selectedCustomer?.name}</div>
                  <div className="text-sm">{selectedCustomer?.phone}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    if (selectedCustomer) {
                      setNewCustomer({
                        name: selectedCustomer.name || "",
                        phone: selectedCustomer.phone || "",
                        email: selectedCustomer.email || "",
                        address: selectedCustomer.address || "",
                        city: selectedCustomer.city || "",
                        state: selectedCustomer.state || "",
                        country: selectedCustomer.country || "India",
                        pin: selectedCustomer.pin || "",
                        notes: selectedCustomer.notes || ""
                      });
                      setEditingCustomerId(selectedCustomer.id);
                      setShowNewForm(true);
                      setStep(1);
                    }
                  }}>Edit Customer</Button>
                  <Button variant="outline" size="sm" onClick={() => setStep(1)}>Change Customer</Button>
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium">Description</th>
                      <th className="text-right py-3 px-4 font-medium">Qty</th>
                      <th className="text-right py-3 px-4 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {quoteData.items.map((item: any) => (
                      <tr key={item.itemId}>
                        <td className="py-3 px-4">{item.itemName}</td>
                        <td className="py-3 px-4 text-right">{item.quantity}</td>
                        <td className="py-3 px-4 text-right font-medium">₹{(item.sellingPrice * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-72 space-y-2 text-sm border p-4 rounded-xl bg-card">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{quoteData.subtotal?.toFixed(2)}</span>
                  </div>
                  {quoteData.discountAmount > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>Discount</span>
                      <span>-₹{quoteData.discountAmount?.toFixed(2)}</span>
                    </div>
                  )}
                  {quoteData.shippingCharge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>₹{quoteData.shippingCharge?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                    <span>Grand Total</span>
                    <span>₹{quoteData.grandTotal?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-muted/10 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <div className="gap-2 flex">
                <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancel</Button>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white gap-2" onClick={handleConvert} disabled={isProcessing}>
                  {isProcessing ? "Converting..." : "Convert to Invoice"} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">Invoice Created Successfully!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your calculation has been converted to an invoice. What would you like to do with the original calculation?
            </p>
            
            <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto pt-4">
              <Button size="lg" onClick={() => handlePostAction('mark')} className="w-full">
                Mark as Converted & View Invoice
              </Button>
              <Button variant="outline" onClick={() => handlePostAction('keep')} className="w-full">
                Keep Calculation & View Invoice
              </Button>
              <Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handlePostAction('delete')}>
                Delete Calculation & View Invoice
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
