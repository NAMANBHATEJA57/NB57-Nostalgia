import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.category.findUnique({
    where: { slug: 'beyblade' }
  });

  if (!existing) {
    await prisma.category.create({
      data: {
        name: 'Beyblade',
        slug: 'beyblade',
        description: 'Beyblade spinning tops and accessories',
        sortOrder: 5,
        featured: true,
      }
    });
    console.log('Beyblade category created successfully.');
  } else {
    console.log('Beyblade category already exists.');
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
