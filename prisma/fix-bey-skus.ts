import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Find the highest existing NB57-XXXX SKU
  const allItems = await prisma.item.findMany({
    where: {
      sku: { startsWith: 'NB57-' }
    },
    select: { sku: true }
  });

  let maxId = 0;
  for (const item of allItems) {
    const match = item.sku.match(/^NB57-(\d{4})$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxId) {
        maxId = num;
      }
    }
  }

  console.log(`Highest existing SKU ID: NB57-${maxId.toString().padStart(4, '0')}`);

  // 2. Find the Beyblade items with the incorrect SKU format
  const beyItems = await prisma.item.findMany({
    where: {
      sku: { startsWith: 'NB57-BEY-' }
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Found ${beyItems.length} items to fix.`);

  // 3. Update them sequentially
  for (const item of beyItems) {
    maxId++;
    const newSku = `NB57-${maxId.toString().padStart(4, '0')}`;
    
    await prisma.item.update({
      where: { id: item.id },
      data: { sku: newSku }
    });
    
    console.log(`Updated ${item.name} from ${item.sku} to ${newSku}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
