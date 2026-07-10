"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";





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
