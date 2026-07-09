"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createInvoice, createCustomer } from "@/app/admin/invoices/actions";
import { calculateInvoiceTotals, formatCurrency } from "@/lib/constants";
import { InvoicePreview } from "./InvoicePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  Trash2,
  User,
  Save,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";

interface AvailableItem {
  id: string;
  name: string;
  sku: string;
  coverImage: string;
  askingPrice: number | null;
  purchasePrice: number | null;
  condition: string;
  quantity: number;
  category: { name: string };
}

interface Customer {
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
}

interface InvoiceItem {
  itemId: string;
  itemName: string;
  itemSku: string;
  itemCondition: string;
  coverImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Props {
  availableItems: AvailableItem[];
  customers: Customer[];
}

export function InvoiceFormWrapper({ availableItems, customers }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Customer state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "", phone: "", email: "", address: "", city: "", state: "", country: "India", pin: "", gstNumber: "",
  });

  // Items state
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [itemSearch, setItemSearch] = useState("");
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  // Charges state
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [shippingCharge, setShippingCharge] = useState<number>(0);
  const [packagingCharge, setPackagingCharge] = useState<number>(0);
  const [miscCharge, setMiscCharge] = useState<number>(0);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("Draft");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [notes, setNotes] = useState("");

  // Section collapse
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    customer: true, items: true, charges: true, payment: true, notes: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Calculate totals
  const totals = useMemo(() => {
    return calculateInvoiceTotals({
      items: invoiceItems,
      taxPercent: taxPercent || null,
      discountPercent: discountPercent || null,
      discountAmount,
      shippingCharge,
      packagingCharge,
      miscCharge,
    });
  }, [invoiceItems, taxPercent, discountPercent, discountAmount, shippingCharge, packagingCharge, miscCharge]);

  // Filter available items
  const filteredItems = useMemo(() => {
    if (!itemSearch) return availableItems.slice(0, 10);
    const q = itemSearch.toLowerCase();
    return availableItems.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q) ||
        i.category.name.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [itemSearch, availableItems]);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers.slice(0, 10);
    const q = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [customerSearch, customers]);

  // Add item to invoice
  const addItem = (item: AvailableItem) => {
    if (invoiceItems.find((i) => i.itemId === item.id)) {
      toast.error("Item already added");
      return;
    }
    const unitPrice = item.askingPrice || 0;
    setInvoiceItems((prev) => [
      ...prev,
      {
        itemId: item.id,
        itemName: item.name,
        itemSku: item.sku,
        itemCondition: item.condition,
        coverImage: item.coverImage,
        quantity: 1,
        unitPrice,
        totalPrice: unitPrice,
      },
    ]);
    setItemSearch("");
    setShowItemDropdown(false);
  };

  // Update item price
  const updateItemPrice = (itemId: string, unitPrice: number) => {
    setInvoiceItems((prev) =>
      prev.map((i) =>
        i.itemId === itemId ? { ...i, unitPrice, totalPrice: i.quantity * unitPrice } : i
      )
    );
  };

  // Update item quantity
  const updateItemQuantity = (itemId: string, quantity: number) => {
    setInvoiceItems((prev) =>
      prev.map((i) =>
        i.itemId === itemId ? { ...i, quantity, totalPrice: quantity * i.unitPrice } : i
      )
    );
  };

  // Remove item
  const removeItem = (itemId: string) => {
    setInvoiceItems((prev) => prev.filter((i) => i.itemId !== itemId));
  };

  // Create customer inline
  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim()) {
      toast.error("Customer name is required");
      return;
    }
    const result = await createCustomer(newCustomer);
    if (result.success && result.customer) {
      setSelectedCustomer(result.customer as Customer);
      setShowNewCustomer(false);
      setNewCustomer({ name: "", phone: "", email: "", address: "", city: "", state: "", country: "India", pin: "", gstNumber: "" });
      toast.success("Customer created");
    } else {
      toast.error(result.error || "Failed to create customer");
    }
  };

  // Submit
  const handleSubmit = () => {
    if (!selectedCustomer && !newCustomer.name.trim()) {
      toast.error("Please select a customer or provide new customer details");
      return;
    }
    if (invoiceItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    startTransition(async () => {
      const result = await createInvoice({
        customerId: selectedCustomer?.id || null,
        customerData: !selectedCustomer ? newCustomer : undefined,
        items: invoiceItems.map((i) => ({
          itemId: i.itemId,
          itemName: i.itemName,
          itemSku: i.itemSku,
          itemCondition: i.itemCondition,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.totalPrice,
        })),
        subtotal: totals.subtotal,
        taxPercent: taxPercent || null,
        taxAmount: totals.taxAmount,
        discountPercent: discountPercent || null,
        discountAmount: totals.discountAmount,
        shippingCharge,
        packagingCharge,
        miscCharge,
        grandTotal: totals.grandTotal,
        paymentMethod: paymentMethod || null,
        paymentStatus,
        amountPaid,
        notes: notes || null,
      });

      if (result.success) {
        toast.success("Invoice created successfully");
        router.push(`/admin/invoices/${result.invoice?.id}`);
      } else {
        toast.error(result.error || "Failed to create invoice");
      }
    });
  };

  // Invoice data for preview
  const previewData = {
    invoiceNumber: "DRAFT",
    date: new Date(),
    customer: selectedCustomer,
    items: invoiceItems,
    subtotal: totals.subtotal,
    taxPercent,
    taxAmount: totals.taxAmount,
    discountAmount: totals.discountAmount,
    shippingCharge,
    packagingCharge,
    miscCharge,
    grandTotal: totals.grandTotal,
    paymentStatus,
    paymentMethod,
    notes,
  };

  return (
    <div className="flex-1 overflow-hidden flex">
      {/* Left: Form */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 border-r border-border">
        {/* Customer Section */}
        <Section
          title="Customer"
          icon={<User className="h-4 w-4" />}
          expanded={expandedSections.customer}
          onToggle={() => toggleSection("customer")}
        >
          {selectedCustomer ? (
            <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/30">
              <div>
                <p className="text-sm font-medium">{selectedCustomer.name}</p>
                <p className="text-xs text-muted-foreground">
                  {[selectedCustomer.phone, selectedCustomer.email].filter(Boolean).join(" · ")}
                </p>
                {selectedCustomer.address && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {[selectedCustomer.address, selectedCustomer.city, selectedCustomer.state, selectedCustomer.pin].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedCustomer(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers by name, phone, or email..."
                  value={customerSearch}
                  onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  className="pl-9"
                />
                {showCustomerDropdown && filteredCustomers.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg max-h-60 overflow-y-auto">
                    {filteredCustomers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="w-full text-left px-4 py-2.5 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                        onClick={() => { setSelectedCustomer(c); setShowCustomerDropdown(false); setCustomerSearch(""); }}
                      >
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {[c.phone, c.email, c.city].filter(Boolean).join(" · ")}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowNewCustomer(!showNewCustomer)}>
                <Plus className="h-4 w-4 mr-1" /> New Customer
              </Button>
              {showNewCustomer && (
                <div className="rounded-lg border border-border p-4 space-y-3 bg-muted/20">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Name *</Label>
                      <Input value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Phone</Label>
                      <Input value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Email</Label>
                      <Input value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">GST Number</Label>
                      <Input value={newCustomer.gstNumber} onChange={(e) => setNewCustomer({ ...newCustomer, gstNumber: e.target.value })} className="h-8 text-sm" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Address</Label>
                    <Input value={newCustomer.address} onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })} className="h-8 text-sm" />
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <Label className="text-xs">City</Label>
                      <Input value={newCustomer.city} onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">State</Label>
                      <Input value={newCustomer.state} onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">Country</Label>
                      <Input value={newCustomer.country} onChange={(e) => setNewCustomer({ ...newCustomer, country: e.target.value })} className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs">PIN</Label>
                      <Input value={newCustomer.pin} onChange={(e) => setNewCustomer({ ...newCustomer, pin: e.target.value })} className="h-8 text-sm" />
                    </div>
                  </div>
                  <Button size="sm" onClick={handleCreateCustomer}>Create Customer</Button>
                </div>
              )}
            </div>
          )}
        </Section>

        {/* Items Section */}
        <Section
          title="Items"
          icon={<FileText className="h-4 w-4" />}
          expanded={expandedSections.items}
          onToggle={() => toggleSection("items")}
        >
          {/* Item search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory by name or SKU..."
              value={itemSearch}
              onChange={(e) => { setItemSearch(e.target.value); setShowItemDropdown(true); }}
              onFocus={() => setShowItemDropdown(true)}
              className="pl-9"
            />
            {showItemDropdown && itemSearch && filteredItems.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg max-h-72 overflow-y-auto">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0 flex items-center gap-3"
                    onClick={() => addItem(item)}
                  >
                    <div className="h-8 w-8 rounded bg-muted overflow-hidden flex-shrink-0">
                      {item.coverImage && (
                        <Image src={item.coverImage} alt={item.name} width={32} height={32} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sku} · {item.category.name} · {item.condition}</p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums flex-shrink-0">
                      {item.askingPrice ? formatCurrency(item.askingPrice) : "–"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Added items */}
          {invoiceItems.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-border rounded-lg">
              <p className="text-sm text-muted-foreground">Search and add items above</p>
            </div>
          ) : (
            <div className="space-y-2">
              {invoiceItems.map((item) => (
                <div key={item.itemId} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className="h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0">
                    {item.coverImage && (
                      <Image src={item.coverImage} alt={item.itemName} width={40} height={40} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.itemName}</p>
                    <p className="text-xs text-muted-foreground">{item.itemSku} · {item.itemCondition}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-16">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(item.itemId, parseInt(e.target.value) || 1)}
                        className="h-8 text-sm text-center"
                        min={1}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">×</span>
                    <div className="w-24">
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItemPrice(item.itemId, parseFloat(e.target.value) || 0)}
                        className="h-8 text-sm text-right"
                        min={0}
                      />
                    </div>
                    <span className="text-sm font-semibold tabular-nums w-20 text-right">
                      {formatCurrency(item.totalPrice)}
                    </span>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.itemId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Charges Section */}
        <Section
          title="Charges & Discounts"
          expanded={expandedSections.charges}
          onToggle={() => toggleSection("charges")}
        >
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Tax %</Label>
              <Input type="number" value={taxPercent || ""} onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)} className="h-8 text-sm" min={0} max={100} placeholder="0" />
            </div>
            <div>
              <Label className="text-xs">Discount %</Label>
              <Input type="number" value={discountPercent || ""} onChange={(e) => { setDiscountPercent(parseFloat(e.target.value) || 0); setDiscountAmount(0); }} className="h-8 text-sm" min={0} max={100} placeholder="0" />
            </div>
            <div>
              <Label className="text-xs">Discount ₹ (flat)</Label>
              <Input type="number" value={discountAmount || ""} onChange={(e) => { setDiscountAmount(parseFloat(e.target.value) || 0); setDiscountPercent(0); }} className="h-8 text-sm" min={0} placeholder="0" />
            </div>
            <div>
              <Label className="text-xs">Shipping ₹</Label>
              <Input type="number" value={shippingCharge || ""} onChange={(e) => setShippingCharge(parseFloat(e.target.value) || 0)} className="h-8 text-sm" min={0} placeholder="0" />
            </div>
            <div>
              <Label className="text-xs">Packaging ₹</Label>
              <Input type="number" value={packagingCharge || ""} onChange={(e) => setPackagingCharge(parseFloat(e.target.value) || 0)} className="h-8 text-sm" min={0} placeholder="0" />
            </div>
            <div>
              <Label className="text-xs">Misc ₹</Label>
              <Input type="number" value={miscCharge || ""} onChange={(e) => setMiscCharge(parseFloat(e.target.value) || 0)} className="h-8 text-sm" min={0} placeholder="0" />
            </div>
          </div>
        </Section>

        {/* Payment Section */}
        <Section
          title="Payment"
          expanded={expandedSections.payment}
          onToggle={() => toggleSection("payment")}
        >
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Payment Method</Label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-8 text-sm rounded-md border border-input bg-background px-3"
              >
                <option value="">Select...</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank">Bank Transfer</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Payment Status</Label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full h-8 text-sm rounded-md border border-input bg-background px-3"
              >
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Amount Paid ₹</Label>
              <Input type="number" value={amountPaid || ""} onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)} className="h-8 text-sm" min={0} placeholder="0" />
            </div>
          </div>
        </Section>

        {/* Notes Section */}
        <Section
          title="Notes"
          expanded={expandedSections.notes}
          onToggle={() => toggleSection("notes")}
        >
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes about this invoice..."
            className="text-sm min-h-[80px]"
          />
        </Section>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <Button onClick={handleSubmit} disabled={isPending} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {isPending ? "Creating..." : "Create Invoice"}
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="w-[480px] flex-shrink-0 overflow-y-auto bg-muted/30 p-6 hidden lg:block">
        <div className="sticky top-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">Live Preview</p>
          <InvoicePreview data={previewData} />
        </div>
      </div>
    </div>
  );
}

// ─── Collapsible Section Component ──────────────────────────

function Section({
  title,
  icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        className="w-full flex items-center justify-between px-5 py-3.5"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {expanded && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}
