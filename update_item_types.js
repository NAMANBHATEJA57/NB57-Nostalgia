const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const items = await prisma.item.findMany();
  let updatedCount = 0;

  for (const item of items) {
    let needsUpdate = false;
    const updateData = {};

    const replaceText = (str) => {
      if (!str) return str;
      let newStr = str
        .replace(/Puzzle Card/gi, "BuildUp Card")
        .replace(/Buildable Card/gi, "BuildUp Card");
      if (newStr !== str) {
        needsUpdate = true;
      }
      return newStr;
    };

    updateData.name = replaceText(item.name);
    updateData.description = replaceText(item.description);
    updateData.metaTitle = replaceText(item.metaTitle);
    updateData.metaDescription = replaceText(item.metaDescription);
    updateData.specifications = replaceText(item.specifications);

    if (needsUpdate) {
      console.log(`Updating item: ${item.name} -> ${updateData.name}`);
      await prisma.item.update({
        where: { id: item.id },
        data: updateData,
      });
      updatedCount++;
    }
  }

  // Also update tags
  const tags = await prisma.tag.findMany();
  for (const tag of tags) {
    if (tag.name.toLowerCase().includes('puzzle card') || tag.name.toLowerCase().includes('buildable card')) {
      const newName = tag.name.replace(/Puzzle Card/gi, "BuildUp Card").replace(/Buildable Card/gi, "BuildUp Card");
      const newSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      console.log(`Updating tag: ${tag.name} -> ${newName}`);
      try {
        await prisma.tag.update({
          where: { id: tag.id },
          data: { name: newName, slug: newSlug }
        });
      } catch (e) {
         console.log(`Could not update tag slug (might exist). Merging or ignoring...`);
      }
    }
  }

  console.log(`Successfully updated ${updatedCount} items.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
