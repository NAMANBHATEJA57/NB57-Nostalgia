'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { verifySession } from '@/lib/session';
import { logActivity } from '@/lib/activity';

export async function createReservation(data: {
  itemId: string;
  customerId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  reason?: string | null;
  deposit?: number;
  notes?: string | null;
  expiryHours?: number;
}) {
  const session = await verifySession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const hours = data.expiryHours || 48;
    const expiryDate = new Date(Date.now() + hours * 60 * 60 * 1000);

    const reservation = await prisma.$transaction(async (tx) => {
      // Create reservation
      const res = await tx.reservation.create({
        data: {
          itemId: data.itemId,
          customerId: data.customerId || null,
          customerName: data.customerName || null,
          customerPhone: data.customerPhone || null,
          reason: data.reason || null,
          deposit: data.deposit || 0,
          notes: data.notes || null,
          expiryDate,
        },
        include: { item: { select: { name: true, sku: true } } },
      });

      // Update item status to Reserved
      await tx.item.update({
        where: { id: data.itemId },
        data: { availability: "Reserved" },
      });

      return res;
    });

    await logActivity({
      action: "Created",
      entity: "Reservation",
      entityId: reservation.id,
      details: { item: reservation.item.name, customer: data.customerName || data.customerId },
    });

    revalidatePath('/admin/reservations');
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/items');

    return { success: true, reservation };
  } catch (error) {
    console.error('Failed to create reservation:', error);
    return { success: false, error: 'Failed to create reservation' };
  }
}

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
