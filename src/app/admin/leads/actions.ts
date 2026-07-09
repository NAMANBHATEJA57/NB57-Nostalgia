"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getLeads() {
  return await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: true
    }
  });
}

export async function updateLeadStatus(id: string, status: string) {
  try {
    await prisma.lead.update({
      where: { id },
      data: { status }
    });
    revalidatePath('/admin/leads');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    console.error("Failed to update lead status:", error);
    return { success: false, error: "Failed to update lead status" };
  }
}

export async function deleteLead(id: string) {
  try {
    await prisma.lead.delete({
      where: { id }
    });
    revalidatePath('/admin/leads');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (error) {
    console.error("Failed to delete lead:", error);
    return { success: false, error: "Failed to delete lead" };
  }
}
