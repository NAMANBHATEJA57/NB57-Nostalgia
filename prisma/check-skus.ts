import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const items = await prisma.item.findMany({
    select: { sku: true },
    orderBy: { sku: 'asc' }
  });
  console.log('Total items:', items.length);
  const skus = items.map(i => i.sku);
  
  const expectedSkus = [];
  for (let i = 1; i <= 111; i++) {
    expectedSkus.push(`NB57-${i.toString().padStart(4, '0')}`);
  }
  
  const missing = expectedSkus.filter(sku => !skus.includes(sku));
  console.log('Missing SKUs:', missing.length);
  if (missing.length > 0) {
    console.log('Sample missing:', missing.slice(0, 10));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
