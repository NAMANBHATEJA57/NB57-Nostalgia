import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const items = await prisma.item.findMany({
    select: { sku: true },
    orderBy: { sku: 'desc' },
    take: 5
  });
  console.log('Highest SKUs:', items);
}
main().finally(() => prisma.$disconnect());
