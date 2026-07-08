import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Get the Bakugan category
  const bakuganCategory = await prisma.category.findUnique({
    where: { slug: 'bakugan' }
  });

  if (!bakuganCategory) {
    console.error("Bakugan category not found! Run add-bakugan.ts first.");
    process.exit(1);
  }

  // 2. Find items containing "bakugan" in their name
  const items = await prisma.item.findMany({
    where: {
      name: {
        contains: 'bakugan',
        mode: 'insensitive' // PostgreSQL only, but we are using PostgreSQL
      }
    }
  });

  console.log(`Found ${items.length} items containing 'bakugan' in their name.`);

  if (items.length > 0) {
    // 3. Update all found items to belong to the Bakugan category
    const result = await prisma.item.updateMany({
      where: {
        id: {
          in: items.map(item => item.id)
        }
      },
      data: {
        categoryId: bakuganCategory.id
      }
    });
    
    console.log(`Successfully updated ${result.count} items to the Bakugan category.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
