import * as z from "zod";

export const itemFormSchema = z.object({
  // Section 1: Identity
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2),
  categoryId: z.string().min(1, "Category is required"),
  subcategory: z.string().optional().nullable(),
  series: z.string().optional().nullable(),
  character: z.string().optional().nullable(),
  manufacturer: z.string().optional().nullable(),
  releaseYear: z.coerce.number().optional().nullable(),
  country: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
  material: z.string().optional().nullable(),
  edition: z.string().optional().nullable(),
  variant: z.string().optional().nullable(),
  finish: z.string().optional().nullable(),
  quantity: z.coerce.number().default(1),

  // Section 2: Images
  coverImage: z.string().min(1, "Cover image is required"),
  images: z.array(z.object({
    url: z.string(),
    publicId: z.string(),
    type: z.string(),
    altText: z.string().optional(),
  })).optional(),

  // Section 3: Description (Rich Text)
  description: z.string().min(1, "Description is required"),
  specifications: z.string().optional().nullable(),
  privateNotes: z.string().optional().nullable(),

  // Section 4: Pricing
  askingPrice: z.coerce.number().optional().nullable(),
  fairValueMin: z.coerce.number().optional().nullable(),
  fairValueMax: z.coerce.number().optional().nullable(),
  highestSeenPrice: z.coerce.number().optional().nullable(),
  lowestSeenPrice: z.coerce.number().optional().nullable(),
  lastSoldPrice: z.coerce.number().optional().nullable(),
  priceSource: z.string().optional().nullable(),
  purchasePrice: z.coerce.number().optional().nullable(),
  purchaseDate: z.string().optional().nullable(),

  // Section 5: Condition & Status
  condition: z.enum(["Factory Sealed", "Near Mint / Not Played", "Excellent", "Good", "Played", "Heavy Played", "Damaged"]),
  availability: z.enum(["Available", "Reserved", "Sold", "Not For Sale"]),
  storageLocation: z.string().optional().nullable(),

  // Section 6: Sales Info
  soldPrice: z.coerce.number().optional().nullable(),
  soldDate: z.string().optional().nullable(),

  // Section 7: Physical
  weight: z.coerce.number().optional().nullable(),
  dimensions: z.string().optional().nullable(),

  // Section 8: Tags
  tags: z.array(z.string()).optional(),

  // Section 9: Flags
  featured: z.boolean().default(false),
  showOnHomepage: z.boolean().default(false),
  trending: z.boolean().default(false),
  recentlyAdded: z.boolean().default(false),
  hideFromPublic: z.boolean().default(false),
  sealed: z.boolean().default(false),
  rare: z.boolean().default(false),
  limited: z.boolean().default(false),
  promo: z.boolean().default(false),
  archived: z.boolean().default(false),

  // Section 10: SEO
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  openGraphImage: z.string().optional().nullable(),

  // Section 11: Publish
  status: z.enum(["Draft", "Published", "Archived"]).default("Draft"),
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;
