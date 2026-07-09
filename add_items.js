const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const itemsToAdd = [
  {
    name: "Four Arms - Ben 10 Cheetos 3D Buildable Card",
    slug: "four-arms-ben-10-3d-buildable-card",
    metaTitle: "Buy Four Arms Ben 10 Vintage 3D Buildable Card | Cheetos India",
    metaDescription: "Looking for the vintage Four Arms from Ben 10? Get this classic Cheetos 3D Buildable Card from India in Unpunched / Good condition. Perfect for collectors!",
    description: "Step back in time with this authentic Cheetos promotional 3D Buildable Card featuring Four Arms from Ben 10. Originally distributed in India, this collectible is a nostalgic piece of pop culture history. Condition is rated as Unpunched / Good. Ideal for display or completing your childhood collection.",
    condition: "Unpunched / Good",
    tags: "Four Arms, Ben 10, Cartoon Network, 3D Buildable Card, Cheetos, Vintage, India Collectible, Retro",
    shortDescription: "Vintage Four Arms 3D Buildable Card from the Ben 10 promotional line by Cheetos.",
    character: "Four Arms",
  },
  {
    name: "Stinkfly - Ben 10 Cheetos 3D Buildable Card",
    slug: "stinkfly-ben-10-3d-buildable-card",
    metaTitle: "Buy Stinkfly Ben 10 Vintage 3D Buildable Card | Cheetos India",
    metaDescription: "Looking for the vintage Stinkfly from Ben 10? Get this classic Cheetos 3D Buildable Card from India in Unpunched / Good condition. Perfect for collectors!",
    description: "Step back in time with this authentic Cheetos promotional 3D Buildable Card featuring Stinkfly from Ben 10. Originally distributed in India, this collectible is a nostalgic piece of pop culture history. Condition is rated as Unpunched / Good. Ideal for display or completing your childhood collection.",
    condition: "Unpunched / Good",
    tags: "Stinkfly, Ben 10, Cartoon Network, 3D Buildable Card, Cheetos, Vintage, India Collectible, Retro",
    shortDescription: "Vintage Stinkfly 3D Buildable Card from the Ben 10 promotional line by Cheetos.",
    character: "Stinkfly",
  },
  {
    name: "Upgrade - Ben 10 Cheetos 3D Buildable Card",
    slug: "upgrade-ben-10-3d-buildable-card",
    metaTitle: "Buy Upgrade Ben 10 Vintage 3D Buildable Card | Cheetos India",
    metaDescription: "Looking for the vintage Upgrade from Ben 10? Get this classic Cheetos 3D Buildable Card from India in Unpunched / Good condition. Perfect for collectors!",
    description: "Step back in time with this authentic Cheetos promotional 3D Buildable Card featuring Upgrade from Ben 10. Originally distributed in India, this collectible is a nostalgic piece of pop culture history. Condition is rated as Unpunched / Good. Ideal for display or completing your childhood collection.",
    condition: "Unpunched / Good",
    tags: "Upgrade, Ben 10, Cartoon Network, 3D Buildable Card, Cheetos, Vintage, India Collectible, Retro",
    shortDescription: "Vintage Upgrade 3D Buildable Card from the Ben 10 promotional line by Cheetos.",
    character: "Upgrade",
  }
];

async function main() {
  const categoryId = "cmr9gvqia007kwrrfq06mqi8s"; // Ben 10 category
  
  // get max sku
  const lastItem = await prisma.item.findFirst({
    orderBy: { sku: 'desc' }
  });
  
  let currentSkuNum = 100;
  if (lastItem && lastItem.sku.startsWith("NB57-")) {
    const num = parseInt(lastItem.sku.split("-")[1], 10);
    if (!isNaN(num)) currentSkuNum = num;
  }

  for (const item of itemsToAdd) {
    currentSkuNum++;
    const sku = `NB57-${String(currentSkuNum).padStart(4, '0')}`;
    console.log(`Adding ${item.name} with sku ${sku}...`);
    
    const specs = {
      shortDescription: item.shortDescription,
      itemType: "3D Buildable Card",
      country: "India",
      rarity: "Rare"
    };

    try {
      const dbItem = await prisma.item.upsert({
        where: { slug: item.slug },
        update: {},
        create: {
          sku: sku,
          slug: item.slug,
          name: item.name,
          description: item.description,
          metaTitle: item.metaTitle,
          metaDescription: item.metaDescription,
          condition: item.condition,
          specifications: JSON.stringify(specs),
          categoryId: categoryId,
          coverImage: "", // Empty for now or placeholder
          askingPrice: 500,
          fairValueMin: 400,
          fairValueMax: 800,
          character: item.character,
          manufacturer: "Cheetos",
          series: "Ben 10",
          releaseYear: 2008,
        }
      });
      
      const tagList = item.tags.split(',').map(t => t.trim());
      for (const t of tagList) {
        const tagSlug = t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (!tagSlug) continue;
        
        let tagRecord = await prisma.tag.findUnique({ where: { slug: tagSlug } });
        if (!tagRecord) {
          tagRecord = await prisma.tag.create({ data: { name: t, slug: tagSlug } });
        }
        
        const existingLink = await prisma.itemTag.findUnique({
           where: { itemId_tagId: { itemId: dbItem.id, tagId: tagRecord.id } }
        });
        if (!existingLink) {
           await prisma.itemTag.create({
             data: { itemId: dbItem.id, tagId: tagRecord.id }
           });
        }
      }
      console.log(`Added ${item.name} successfully.`);
    } catch (e) {
      console.error(`Failed to add ${item.name}`, e);
    }
  }
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
