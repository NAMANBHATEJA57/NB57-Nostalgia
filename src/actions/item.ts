"use server";

import { prisma } from "@/lib/prisma";
import { ItemFormValues, itemFormSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createItem(data: ItemFormValues) {
  try {
    const validData = itemFormSchema.parse(data);

    // Generate SKU based on the max valid numeric ID.
    const allItems = await prisma.item.findMany({
      select: { sku: true }
    });

    let maxNumber = 0;
    for (const item of allItems) {
      const match = item.sku.match(/^NB57-(\d{4})$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    }
    const nextNumber = maxNumber + 1;
    const sku = `NB57-${nextNumber.toString().padStart(4, '0')}`;

    // Handle tags (create or connect)
    const tagConnections = validData.tags ? validData.tags.map(tag => ({
      tag: {
        connectOrCreate: {
          where: { slug: tag.toLowerCase().replace(/\s+/g, '-') },
          create: { name: tag, slug: tag.toLowerCase().replace(/\s+/g, '-') }
        }
      }
    })) : [];

    // Create item
    const newItem = await prisma.item.create({
      data: {
        sku,
        slug: validData.slug,
        name: validData.name,
        description: validData.description,
        specifications: validData.specifications,
        privateNotes: validData.privateNotes,
        categoryId: validData.categoryId,
        subcategory: validData.subcategory,
        series: validData.series,
        character: validData.character,
        manufacturer: validData.manufacturer,
        releaseYear: validData.releaseYear,
        condition: validData.condition,
        availability: validData.availability,
        askingPrice: validData.askingPrice,
        fairValueMin: validData.fairValueMin,
        fairValueMax: validData.fairValueMax,
        highestSeenPrice: validData.highestSeenPrice,
        lowestSeenPrice: validData.lowestSeenPrice,
        priceSource: validData.priceSource,
        purchasePrice: validData.purchasePrice,
        purchaseDate: validData.purchaseDate ? new Date(validData.purchaseDate) : null,
        soldPrice: validData.soldPrice,
        soldDate: validData.soldDate ? new Date(validData.soldDate) : null,
        
        // Homepage / Flags
        featured: validData.featured,
        showOnHomepage: validData.showOnHomepage,
        trending: validData.trending,
        recentlyAdded: validData.recentlyAdded,
        hideFromPublic: validData.hideFromPublic,
        
        quantity: validData.quantity,
        coverImage: validData.coverImage,
        
        // SEO
        metaTitle: validData.metaTitle,
        metaDescription: validData.metaDescription,
        openGraphImage: validData.openGraphImage,
        
        itemTags: {
          create: tagConnections
        },
        
        images: {
          create: validData.images?.map((img, idx) => ({
            url: img.url,
            publicId: img.publicId,
            type: img.type,
            order: idx
          })) || []
        }
      }
    });

    revalidatePath('/admin/items');
    revalidatePath('/collection');
    revalidatePath('/');
    
    return { success: true, item: newItem };
  } catch (error: any) {
    console.error("Failed to create item:", error);
    return { success: false, error: error.message || "Failed to create item" };
  }
}
