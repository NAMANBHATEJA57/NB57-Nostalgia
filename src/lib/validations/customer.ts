import * as z from "zod";

export const customerFormSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z.string().optional().nullable(),
  email: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().default("India"),
  pin: z.string().optional().nullable(),
  gstNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
