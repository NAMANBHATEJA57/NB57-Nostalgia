'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deleteItem(id: string) {
  try {
    await prisma.item.delete({
      where: { id },
    });
    
    revalidatePath('/admin/items');
    revalidatePath('/admin/dashboard');
    revalidatePath('/collection');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete item:', error);
    return { success: false, error: 'Failed to delete item' };
  }
}

export async function deleteItems(ids: string[]) {
  try {
    await prisma.item.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    
    revalidatePath('/admin/items');
    revalidatePath('/admin/dashboard');
    revalidatePath('/collection');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete items:', error);
    return { success: false, error: 'Failed to delete items' };
  }
}

export async function duplicateItem(id: string) {
  try {
    const itemToDuplicate = await prisma.item.findUnique({
      where: { id },
      include: {
        images: true,
      }
    });

    if (!itemToDuplicate) {
      return { success: false, error: 'Item not found' };
    }

    const lastItem = await prisma.item.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { sku: true }
    });

    let nextNumber = 1;
    if (lastItem && lastItem.sku.startsWith('NB57-')) {
      const lastNumber = parseInt(lastItem.sku.split('-')[1], 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    const sku = `NB57-${nextNumber.toString().padStart(4, '0')}`;
    const slug = `${itemToDuplicate.slug}-copy-${Date.now()}`;

    // Remove fields that should not be duplicated identically or are generated
    const { id: _, createdAt: __, updatedAt: ___, sku: ____, slug: _____, images, ...dataToDuplicate } = itemToDuplicate;

    const newItem = await prisma.item.create({
      data: {
        ...dataToDuplicate,
        sku,
        slug,
        name: `${itemToDuplicate.name} (Copy)`,
        duplicate: true,
        images: {
          create: images.map(({ id: _imgId, itemId: _imgItemId, createdAt: _imgCreatedAt, updatedAt: _imgUpdatedAt, ...imgData }) => imgData)
        }
      },
      include: {
        category: true
      }
    });

    revalidatePath('/admin/items');
    revalidatePath('/admin/dashboard');
    revalidatePath('/collection');
    return { success: true, item: newItem };
  } catch (error: any) {
    console.error('Failed to duplicate item:', error);
    return { success: false, error: 'Failed to duplicate item' };
  }
}
