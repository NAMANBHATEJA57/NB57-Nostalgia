'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { verifySession } from '@/lib/session';

export async function deleteItem(id: string) {
  const session = await verifySession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    await prisma.item.delete({
      where: { id },
    });
    
    revalidatePath('/');
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
  const session = await verifySession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    await prisma.item.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    
    revalidatePath('/');
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
  const session = await verifySession();
  if (!session) return { success: false, error: 'Unauthorized' };

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

    revalidatePath('/');
    revalidatePath('/admin/items');
    revalidatePath('/admin/dashboard');
    revalidatePath('/collection');
    return { success: true, item: newItem };
  } catch (error: any) {
    console.error('Failed to duplicate item:', error);
    return { success: false, error: 'Failed to duplicate item' };
  }
}

export async function getAllItemsForExport() {
  const session = await verifySession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const items = await prisma.item.findMany({
      include: {
        category: { select: { name: true } },
        itemTags: { include: { tag: true } },
        images: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return { success: true, items };
  } catch (error) {
    console.error('Failed to fetch items for export:', error);
    return { success: false, error: 'Failed to fetch items' };
  }
}
