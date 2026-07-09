"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createLead(data: {
  buyerName: string;
  phone: string;
  city?: string;
  state?: string;
  country?: string;
  email?: string;
  notes?: string;
  items: {
    id: string;
    name: string;
    sku: string;
    condition?: string;
    estimatedPrice: number;
  }[];
  estimatedTotal: number;
}) {
  try {
    // Generate lead number: NB57-LD-YYYYMM-XXXX
    const date = new Date();
    const prefix = `NB57-LD-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Get last lead of this month to increment
    const lastLead = await prisma.lead.findFirst({
      where: { leadNumber: { startsWith: prefix } },
      orderBy: { leadNumber: 'desc' }
    });

    let sequence = 1;
    if (lastLead) {
      const lastSeq = parseInt(lastLead.leadNumber.split('-').pop() || '0');
      if (!isNaN(lastSeq)) sequence = lastSeq + 1;
    }

    const leadNumber = `${prefix}-${sequence.toString().padStart(4, '0')}`;

    const lead = await prisma.lead.create({
      data: {
        leadNumber,
        buyerName: data.buyerName,
        phone: data.phone,
        city: data.city,
        state: data.state,
        country: data.country || "India",
        email: data.email,
        notes: data.notes,
        estimatedValue: data.estimatedTotal,
        items: {
          create: data.items.map(item => ({
            itemId: item.id,
            itemName: item.name,
            itemSku: item.sku,
            itemCondition: item.condition,
            estimatedPrice: item.estimatedPrice
          }))
        }
      }
    });

    revalidatePath('/admin/leads');
    revalidatePath('/admin/dashboard');

    return { success: true, lead };
  } catch (error) {
    console.error("Failed to create lead:", error);
    return { success: false, error: "Failed to create inquiry" };
  }
}
