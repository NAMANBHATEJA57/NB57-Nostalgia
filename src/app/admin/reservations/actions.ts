'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { verifySession } from '@/lib/session';
import { logActivity } from '@/lib/activity';



export async function cancelReservation(id: string) {
  const session = await verifySession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      select: { itemId: true },
    });
    if (!reservation) return { success: false, error: 'Reservation not found' };

    await prisma.$transaction([
      prisma.reservation.update({
        where: { id },
        data: { status: "Cancelled" },
      }),
      prisma.item.update({
        where: { id: reservation.itemId },
        data: { availability: "Available" },
      }),
    ]);

    await logActivity({ action: "Cancelled", entity: "Reservation", entityId: id });

    revalidatePath('/admin/reservations');
    revalidatePath('/admin/items');
    revalidatePath('/admin/dashboard');

    return { success: true };
  } catch (error) {
    console.error('Failed to cancel reservation:', error);
    return { success: false, error: 'Failed to cancel reservation' };
  }
}

export async function expireReservations() {
  const session = await verifySession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const expired = await prisma.reservation.findMany({
      where: { status: "Active", expiryDate: { lte: new Date() } },
      select: { id: true, itemId: true },
    });

    for (const res of expired) {
      await prisma.$transaction([
        prisma.reservation.update({
          where: { id: res.id },
          data: { status: "Expired" },
        }),
        prisma.item.update({
          where: { id: res.itemId },
          data: { availability: "Available" },
        }),
      ]);
    }

    revalidatePath('/admin/reservations');
    revalidatePath('/admin/items');
    revalidatePath('/admin/dashboard');

    return { success: true, count: expired.length };
  } catch (error) {
    console.error('Failed to expire reservations:', error);
    return { success: false, error: 'Failed to expire reservations' };
  }
}
