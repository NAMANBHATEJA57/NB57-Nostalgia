const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const invoices = await prisma.invoice.findMany({
    where: { paymentStatus: 'Paid' },
    include: { ledgerEntries: true, items: true }
  });

  for (const inv of invoices) {
    if (inv.ledgerEntries.length === 0) {
      console.log('Missing ledger for:', inv.invoiceNumber);
      
      const itemIds = inv.items.map(i => i.itemId);
      const itemRecords = await prisma.item.findMany({
        where: { id: { in: itemIds } }
      });
      const purchasePriceMap = new Map(itemRecords.map(i => [i.id, i.purchasePrice || 0]));
      const totalPurchasePrice = inv.items.reduce((sum, item) => sum + (purchasePriceMap.get(item.itemId) || 0) * item.quantity, 0);

      const entries = [];
      if (inv.grandTotal > 0) entries.push({ invoiceId: inv.id, type: 'Revenue', amount: inv.grandTotal, description: 'Invoice revenue' });
      if (totalPurchasePrice > 0) entries.push({ invoiceId: inv.id, type: 'InventoryCost', amount: -totalPurchasePrice, description: 'Inventory cost' });
      if (inv.shippingCharge > 0) entries.push({ invoiceId: inv.id, type: 'Shipping', amount: inv.shippingCharge, description: 'Shipping charge' });
      if (inv.packagingCharge > 0) entries.push({ invoiceId: inv.id, type: 'Packaging', amount: inv.packagingCharge, description: 'Packaging charge' });
      if (inv.miscCharge > 0) entries.push({ invoiceId: inv.id, type: 'Misc', amount: inv.miscCharge, description: 'Miscellaneous charges' });
      
      const profit = inv.grandTotal - totalPurchasePrice;
      if (profit !== 0) entries.push({ invoiceId: inv.id, type: 'Profit', amount: profit, description: 'Net profit' });
      
      if (entries.length > 0) {
        await prisma.ledgerEntry.createMany({ data: entries });
        console.log('Fixed ledger for', inv.invoiceNumber);
      }
    }
  }
}

fix().catch(console.error).finally(() => prisma.$disconnect());
