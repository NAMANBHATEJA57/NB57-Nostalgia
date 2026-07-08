import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.upsert({
    where: { slug: 'bakugan' },
    update: {},
    create: {
      name: 'Bakugan',
      slug: 'bakugan',
    },
  });
  console.log('Category upserted:', category);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
