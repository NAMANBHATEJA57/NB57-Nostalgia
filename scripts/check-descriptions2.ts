import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const items = await prisma.item.findMany({
    select: { id: true, name: true, description: true }
  })
  
  const withTags = items.filter(i => 
    i.description.includes('<p>') || 
    i.description.includes('</p>') || 
    i.description.includes('<strong>') || 
    i.description.includes('</strong>')
  );
  console.log(`Items with ANY p or strong tags: ${withTags.length}`);

  if (withTags.length > 0) {
    console.log(withTags[0].name)
    console.log(withTags[0].description)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
