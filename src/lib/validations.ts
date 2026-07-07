import * as z from "zod";

export const itemFormSchema = z.object({
  // Section 1: Basic Info
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2),
  categoryId: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  series: z.string().optional(),
  character: z.string().optional(),
  manufacturer: z.string().optional(),
  releaseYear: z.coerce.number().optional().nullable(),
  quantity: z.coerce.number().default(1),

  // Section 2: Images
  coverImage: z.string().min(1, "Cover image is required"),
  images: z.array(z.object({
    url: z.string(),
    publicId: z.string(),
    type: z.string(), 
  })).optional(),

  // Section 3: Description (Rich Text)
  description: z.string().min(1, "Description is required"),
  specifications: z.string().optional(),
  privateNotes: z.string().optional(),

  // Section 4: Pricing
  askingPrice: z.coerce.number().optional().nullable(),
  fairValueMin: z.coerce.number().optional().nullable(),
  fairValueMax: z.coerce.number().optional().nullable(),
  highestSeenPrice: z.coerce.number().optional().nullable(),
  lowestSeenPrice: z.coerce.number().optional().nullable(),
  priceSource: z.string().optional(), // Now just a string (Reddit, eBay, etc)
  purchasePrice: z.coerce.number().optional().nullable(),
  purchaseDate: z.string().optional().nullable(),

  // Section 5: Condition
  condition: z.enum(["Factory Sealed", "Excellent", "Good", "Played", "Heavy Played", "Damaged"]),

  // Section 6: Availability
  availability: z.enum(["Available", "Reserved", "Sold", "Not For Sale"]),
  soldPrice: z.coerce.number().optional().nullable(),
  soldDate: z.string().optional().nullable(),
  
  // Section 7: Tags
  tags: z.array(z.string()).optional(),
  
  // Section 8: Homepage Controls (Flags)
  featured: z.boolean().default(false),
  showOnHomepage: z.boolean().default(false),
  trending: z.boolean().default(false),
  recentlyAdded: z.boolean().default(false),
  hideFromPublic: z.boolean().default(false),

  // Section 9: SEO
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  openGraphImage: z.string().optional(),

  // Section 10: Publish
  status: z.enum(["Draft", "Published", "Archived"]).default("Draft"),
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;
