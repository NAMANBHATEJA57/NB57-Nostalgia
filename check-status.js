const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const items = await prisma.item.findMany({ select: { availability: true }, distinct: ['availability'] });
  const invoices = await prisma.invoice.findMany({ select: { paymentStatus: true }, distinct: ['paymentStatus'] });
  console.log('Item Availabilities:', items.map(i => i.availability));
  console.log('Invoice Statuses:', invoices.map(i => i.paymentStatus));
}

check().catch(console.error).finally(() => prisma.$disconnect());
