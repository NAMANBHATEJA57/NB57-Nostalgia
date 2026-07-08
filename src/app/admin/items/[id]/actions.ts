'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/session';

export async function updateItem(id: string, formData: FormData) {
  const session = await verifySession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const askingPriceStr = formData.get('askingPrice') as string;
  const askingPrice = askingPriceStr ? parseFloat(askingPriceStr) : null;
  const condition = formData.get('condition') as string;
  const quantityStr = formData.get('quantity') as string;
  const quantity = quantityStr ? parseInt(quantityStr, 10) : 1;
  const availability = formData.get('availability') as string;
  const description = formData.get('description') as string;
  const coverImage = formData.get('coverImage') as string;
  
  const extraImagesJson = formData.get('extraImagesJson') as string;
  let extraImages: string[] = [];
  try {
    if (extraImagesJson) {
      extraImages = JSON.parse(extraImagesJson);
    }
  } catch (e) {
    console.error('Failed to parse extraImagesJson', e);
  }

  // Update item details and delete existing extra images in a transaction
  await prisma.$transaction([
    prisma.item.update({
      where: { id },
      data: {
        name,
        askingPrice,
        condition,
        quantity,
        availability,
        description,
        coverImage
      }
    }),
    prisma.image.deleteMany({
      where: { itemId: id }
    }),
    ...extraImages.map((url, index) => 
      prisma.image.create({
        data: {
          url,
          publicId: `url-${Date.now()}-${index}`, // Dummy publicId for URL-based images
          itemId: id,
          order: index,
          type: 'Extra'
        }
      })
    )
  ]);

  revalidatePath('/admin/items');
  revalidatePath('/admin/dashboard');
  revalidatePath(`/collection`);
  revalidatePath(`/admin/items/${id}`);
  
  redirect('/admin/items');
}
