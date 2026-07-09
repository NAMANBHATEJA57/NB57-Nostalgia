import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const items = await prisma.item.findMany({
    select: { id: true, name: true, description: true }
  })
  
  const withEmpty = items.filter(i => {
    const desc = i.description;
    return desc.match(/<p>\s*<\/p>/) || desc.match(/<strong>\s*<\/strong>/) || desc.match(/<p><\/p>/) || desc.match(/<strong><\/strong>/) || desc.match(/<p>&nbsp;<\/p>/);
  });
  console.log(`Items with empty tags: ${withEmpty.length}`);

  if (withEmpty.length > 0) {
    console.log(withEmpty[0].name)
    console.log(withEmpty[0].description)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
