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
