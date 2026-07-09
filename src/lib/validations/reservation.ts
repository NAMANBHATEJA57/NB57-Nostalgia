import * as z from "zod";

export const reservationFormSchema = z.object({
  itemId: z.string().min(1, "Item is required"),
  customerId: z.string().optional().nullable(),
  customerName: z.string().optional().nullable(),
  customerPhone: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
  deposit: z.coerce.number().min(0).default(0),
  notes: z.string().optional().nullable(),
  expiryHours: z.coerce.number().min(1).default(48),
});

export type ReservationFormValues = z.infer<typeof reservationFormSchema>;

// Status transitions
export const RESERVATION_STATUSES = ["Active", "Expired", "Converted", "Cancelled"] as const;
export type ReservationStatus = typeof RESERVATION_STATUSES[number];
