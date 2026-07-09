import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany({
    include: { _count: { select: { invoices: true } } },
  });

  for (const c of customers) {
    console.log(`- ${c.name} (orders: ${c._count.invoices})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
