import * as z from "zod";

// ─── Invoice Item Schema ─────────────────────────────────────

export const invoiceItemSchema = z.object({
  itemId: z.string().min(1, "Item is required"),
  itemName: z.string(),
  itemSku: z.string(),
  itemCondition: z.string().optional(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1").default(1),
  unitPrice: z.coerce.number().min(0, "Price must be positive"),
  totalPrice: z.coerce.number(),
});

// ─── Invoice Form Schema ─────────────────────────────────────

export const invoiceFormSchema = z.object({
  // Customer
  customerId: z.string().min(1, "Customer is required"),

  // Items
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),

  // Charges
  taxPercent: z.coerce.number().min(0).max(100).optional().nullable(),
  taxAmount: z.coerce.number().min(0).default(0),
  discountPercent: z.coerce.number().min(0).max(100).optional().nullable(),
  discountAmount: z.coerce.number().min(0).default(0),
  shippingCharge: z.coerce.number().min(0).default(0),
  packagingCharge: z.coerce.number().min(0).default(0),
  miscCharge: z.coerce.number().min(0).default(0),

  // Calculated
  subtotal: z.coerce.number().default(0),
  grandTotal: z.coerce.number().default(0),

  // Payment
  paymentMethod: z.enum(["Cash", "UPI", "Bank"]).optional().nullable(),
  paymentStatus: z.enum(["Paid", "Pending", "Partial", "Cancelled", "Draft"]).default("Draft"),
  amountPaid: z.coerce.number().min(0).default(0),

  // Extras
  notes: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
  courierName: z.string().optional().nullable(),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
export type InvoiceItemFormValues = z.infer<typeof invoiceItemSchema>;
