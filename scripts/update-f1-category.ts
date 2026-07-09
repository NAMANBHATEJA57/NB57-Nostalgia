import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.findFirst({
    where: { name: { contains: 'Others', mode: 'insensitive' } }
  });

  if (!category) {
    console.error("Category 'Others' not found");
    return;
  }

  const item = await prisma.item.update({
    where: { slug: "topps-f1-f2-turbo-attax-card-bundle-8-pack" },
    data: { categoryId: category.id }
  });

  console.log("Updated category to", category.name, "for item:", item.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
