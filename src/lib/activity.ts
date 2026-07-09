'use server';

import { prisma } from '@/lib/prisma';

/**
 * Log an activity to the ActivityLog table.
 * Fire-and-forget — never blocks the caller.
 */
export async function logActivity(params: {
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, unknown>;
  admin?: string;
  tx?: any; // Allow passing Prisma transaction client
}) {
  try {
    const client = params.tx || prisma;
    await client.activityLog.create({
      data: {
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        details: params.details ? JSON.stringify(params.details) : null,
        admin: params.admin || "Admin",
      },
    });
  } catch (error) {
    // Silently fail — activity logging should never break the main flow
    console.error("Failed to log activity:", error);
  }
}

/**
 * Log an invoice timeline event.
 * Append-only — never overwrites existing entries.
 */
export async function logInvoiceTimeline(params: {
  invoiceId: string;
  event: string;
  admin?: string;
  notes?: string;
  tx?: any;
}) {
  try {
    const client = params.tx || prisma;
    await client.invoiceTimeline.create({
      data: {
        invoiceId: params.invoiceId,
        event: params.event,
        admin: params.admin || "Admin",
        notes: params.notes || null,
      },
    });
  } catch (error) {
    console.error("Failed to log invoice timeline:", error);
  }
}

/**
 * Create ledger entries for an invoice.
 */
export async function createLedgerEntries(params: {
  invoiceId: string;
  revenue: number;
  inventoryCost: number;
  shippingCharge: number;
  packagingCharge: number;
  miscCharge: number;
  tx?: any;
}) {
  const entries = [];
  const client = params.tx || prisma;

  if (params.revenue > 0) {
    entries.push({
      invoiceId: params.invoiceId,
      type: "Revenue",
      amount: params.revenue,
      description: "Invoice revenue",
    });
  }

  if (params.inventoryCost > 0) {
    entries.push({
      invoiceId: params.invoiceId,
      type: "InventoryCost",
      amount: -params.inventoryCost,
      description: "Inventory cost (purchase price of sold items)",
    });
  }

  if (params.shippingCharge > 0) {
    entries.push({
      invoiceId: params.invoiceId,
      type: "Shipping",
      amount: params.shippingCharge,
      description: "Shipping charge",
    });
  }

  if (params.packagingCharge > 0) {
    entries.push({
      invoiceId: params.invoiceId,
      type: "Packaging",
      amount: params.packagingCharge,
      description: "Packaging charge",
    });
  }

  if (params.miscCharge > 0) {
    entries.push({
      invoiceId: params.invoiceId,
      type: "Misc",
      amount: params.miscCharge,
      description: "Miscellaneous charges",
    });
  }

  // Calculate profit
  const profit = params.revenue - params.inventoryCost;
  if (profit !== 0) {
    entries.push({
      invoiceId: params.invoiceId,
      type: "Profit",
      amount: profit,
      description: `Net profit: Revenue (${params.revenue}) - Cost (${params.inventoryCost})`,
    });
  }

  if (entries.length > 0) {
    await client.ledgerEntry.createMany({ data: entries });
  }
}

/**
 * Reverse all ledger entries for an invoice (on deletion).
 */
export async function reverseLedgerEntries(invoiceId: string, tx?: any) {
  const client = tx || prisma;
  
  const entries = await client.ledgerEntry.findMany({
    where: { invoiceId, reversed: false },
  });

  if (entries.length === 0) return;

  // Mark existing entries as reversed
  await client.ledgerEntry.updateMany({
    where: { invoiceId, reversed: false },
    data: { reversed: true, reversedAt: new Date() },
  });

  // Create reversal entries
  const reversalEntries = entries.map((entry: any) => ({
    invoiceId,
    type: "Deletion" as const,
    amount: -entry.amount,
    description: `Reversal of ${entry.type}: ${entry.description}`,
    notes: `Original entry: ${entry.id}`,
  }));

  await client.ledgerEntry.createMany({ data: reversalEntries });
}
