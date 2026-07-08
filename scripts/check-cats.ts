import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  console.log(categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
