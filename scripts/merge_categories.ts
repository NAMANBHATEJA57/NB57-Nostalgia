import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find or create "Others" category
  let othersCategory = await prisma.category.findUnique({ where: { slug: 'others' } });
  
  if (!othersCategory) {
    // If Misc exists, just rename it to Others
    const miscCategory = await prisma.category.findFirst({ where: { name: 'Misc' } });
    if (miscCategory) {
      othersCategory = await prisma.category.update({
        where: { id: miscCategory.id },
        data: { name: 'Others', slug: 'others' }
      });
      console.log('Renamed Misc to Others');
    } else {
      othersCategory = await prisma.category.create({
        data: { name: 'Others', slug: 'others' }
      });
      console.log('Created Others category');
    }
  }

  // Find Bakugan category
  const bakuganCategory = await prisma.category.findFirst({ where: { name: 'Bakugan' } });
  
  if (bakuganCategory && othersCategory) {
    // Move all items from Bakugan to Others
    const updateResult = await prisma.item.updateMany({
      where: { categoryId: bakuganCategory.id },
      data: { categoryId: othersCategory.id }
    });
    console.log(`Moved ${updateResult.count} items from Bakugan to Others`);
    
    // Delete Bakugan category
    await prisma.category.delete({
      where: { id: bakuganCategory.id }
    });
    console.log('Deleted Bakugan category');
  }
}

main().finally(() => prisma.$disconnect());
