import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const items = await prisma.item.findMany({
    select: { id: true, name: true, description: true }
  })
  
  for (let i = 0; i < Math.min(items.length, 5); i++) {
    console.log(items[i].name)
    console.log(items[i].description)
    console.log('---')
  }
  
  // also check if there are any that have exactly "<p> </p> <strong> </strong>"
  const withExact = items.filter(i => i.description.includes('<p> </p>') || i.description.includes('<strong> </strong>'));
  console.log(`Items with exact empty tags: ${withExact.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
