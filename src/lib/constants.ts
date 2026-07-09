/**
 * Status Flow Engine for Inventory Items
 * 
 * Standard flow: Available → Reserved → Sold → Archived
 * Admin can manually override to any status.
 */

export const ITEM_STATUSES = ["Available", "Reserved", "Sold", "Not For Sale"] as const;
export type ItemStatus = typeof ITEM_STATUSES[number];

export const ITEM_CONDITIONS = [
  "Factory Sealed",
  "Near Mint / Not Played",
  "Excellent",
  "Good",
  "Played",
  "Heavy Played",
  "Damaged",
] as const;
export type ItemCondition = typeof ITEM_CONDITIONS[number];

// Standard transition map (non-admin)
const STANDARD_TRANSITIONS: Record<string, string[]> = {
  "Available": ["Reserved", "Sold", "Not For Sale"],
  "Reserved": ["Sold", "Available"],
  "Sold": ["Archived", "Available"],
  "Not For Sale": ["Available"],
  "Archived": ["Available"],
};

/**
 * Check if a status transition is valid.
 * Admin override always returns true.
 */
export function isValidTransition(
  currentStatus: string,
  targetStatus: string,
  adminOverride: boolean = true
): boolean {
  if (adminOverride) return true;
  const allowed = STANDARD_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(targetStatus) : false;
}

/**
 * Get allowed status transitions for a given status.
 */
export function getAllowedTransitions(currentStatus: string): string[] {
  return STANDARD_TRANSITIONS[currentStatus] || [];
}

/**
 * Payment statuses for invoices
 */
export const PAYMENT_STATUSES = ["Paid", "Pending", "Partial", "Cancelled", "Draft"] as const;
export type PaymentStatus = typeof PAYMENT_STATUSES[number];

export const PAYMENT_METHODS = ["Cash", "UPI", "Bank"] as const;
export type PaymentMethod = typeof PAYMENT_METHODS[number];

/**
 * Invoice timeline event types
 */
export const TIMELINE_EVENTS = [
  "Created",
  "Edited",
  "Draft",
  "Reserved",
  "Paid",
  "Downloaded",
  "WhatsAppShared",
  "Packed",
  "Shipped",
  "Delivered",
  "Completed",
  "Deleted",
] as const;
export type TimelineEvent = typeof TIMELINE_EVENTS[number];

/**
 * Ledger entry types
 */
export const LEDGER_TYPES = [
  "Revenue",
  "InventoryCost",
  "Shipping",
  "Packaging",
  "Misc",
  "Profit",
  "Refund",
  "Deletion",
] as const;
export type LedgerType = typeof LEDGER_TYPES[number];

/**
 * Activity log entity types
 */
export const ACTIVITY_ENTITIES = [
  "Item",
  "Invoice",
  "Customer",
  "Reservation",
  "Category",
  "Blog",
  "Ledger",
] as const;
export type ActivityEntity = typeof ACTIVITY_ENTITIES[number];

/**
 * Generate next invoice number: NB57-INV-YYYYMM-XXXX
 */
export function generateInvoiceNumber(existingNumbers: string[]): string {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prefix = `NB57-INV-${yearMonth}-`;
  
  let maxSeq = 0;
  for (const num of existingNumbers) {
    if (num.startsWith(prefix)) {
      const seq = parseInt(num.slice(prefix.length), 10);
      if (!isNaN(seq) && seq > maxSeq) {
        maxSeq = seq;
      }
    }
  }
  
  return `${prefix}${String(maxSeq + 1).padStart(4, "0")}`;
}

/**
 * Generate next SKU: NB57-XXXX
 */
export function generateSku(existingSkus: string[]): string {
  let maxNumber = 0;
  for (const sku of existingSkus) {
    const match = sku.match(/^NB57-(\d{4})$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNumber) maxNumber = num;
    }
  }
  return `NB57-${String(maxNumber + 1).padStart(4, "0")}`;
}

/**
 * Generate slug from name
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Format currency (INR)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate invoice totals
 */
export function calculateInvoiceTotals(params: {
  items: { quantity: number; unitPrice: number }[];
  taxPercent?: number | null;
  discountPercent?: number | null;
  discountAmount?: number;
  shippingCharge?: number;
  packagingCharge?: number;
  miscCharge?: number;
}) {
  const subtotal = params.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  let discountAmount = params.discountAmount || 0;
  if (params.discountPercent && params.discountPercent > 0) {
    discountAmount = (subtotal * params.discountPercent) / 100;
  }

  const afterDiscount = subtotal - discountAmount;

  let taxAmount = 0;
  if (params.taxPercent && params.taxPercent > 0) {
    taxAmount = (afterDiscount * params.taxPercent) / 100;
  }

  const grandTotal =
    afterDiscount +
    taxAmount +
    (params.shippingCharge || 0) +
    (params.packagingCharge || 0) +
    (params.miscCharge || 0);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
  };
}

/**
 * Calculate profit for an invoice
 */
export function calculateProfit(params: {
  sellingPrice: number;
  purchasePrice: number;
  shippingCost?: number;
  packagingCost?: number;
  fees?: number;
  misc?: number;
}) {
  const totalCost =
    params.purchasePrice +
    (params.shippingCost || 0) +
    (params.packagingCost || 0) +
    (params.fees || 0) +
    (params.misc || 0);

  const grossProfit = params.sellingPrice - params.purchasePrice;
  const netProfit = params.sellingPrice - totalCost;
  const margin = params.sellingPrice > 0 ? (netProfit / params.sellingPrice) * 100 : 0;

  return {
    grossProfit: Math.round(grossProfit * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    margin: Math.round(margin * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
  };
}
