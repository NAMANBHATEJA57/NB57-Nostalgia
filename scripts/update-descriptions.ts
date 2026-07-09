import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const items = await prisma.item.findMany({
    select: { id: true, description: true }
  })
  
  let updatedCount = 0;
  
  for (const item of items) {
    if (!item.description) continue;
    
    // Convert </p><p> to space or newline to prevent words from running together
    // actually, let's just replace </p> with a space, then remove the rest, then clean up extra spaces
    let newDesc = item.description
      .replace(/<\/p>/g, ' ')
      .replace(/<p>/g, '')
      .replace(/<strong>/g, '')
      .replace(/<\/strong>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
      
    if (newDesc !== item.description) {
      await prisma.item.update({
        where: { id: item.id },
        data: { description: newDesc }
      })
      updatedCount++;
    }
  }
  console.log(`Updated ${updatedCount} items.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
