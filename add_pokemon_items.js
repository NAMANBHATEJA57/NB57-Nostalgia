const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const itemsToAdd = [
  {
    name: "Oddish Line - Pokémon Cheetos Tops Toys",
    slug: "oddish-line-pokemon-tops-toys",
    metaTitle: "Buy Oddish Line Pokémon Vintage Tops Toys | Cheetos India",
    metaDescription: "Looking for the vintage Oddish Line from Pokémon? Get this classic Cheetos Tops Toys from India in Moderately Played condition. Perfect for collectors!",
    description: "Step back in time with this authentic Cheetos promotional Tops Toys featuring Oddish Line from Pokémon. Originally distributed in India, this collectible is a nostalgic piece of pop culture history. Condition is rated as Moderately Played. Ideal for display or completing your childhood collection.",
    condition: "Moderately Played",
    tags: "Oddish Line, Pokémon, Tops Toys, Cheetos, Vintage, India Collectible, Retro",
    shortDescription: "Vintage Oddish Line Tops Toys from the Pokémon promotional line by Cheetos.",
    character: "Oddish Line",
    itemType: "Tops Toys"
  },
  {
    name: "Grimer (#088) - Pokémon Cheetos Jenga Card",
    slug: "grimer-088-pokemon-jenga-card",
    metaTitle: "Buy Grimer (#088) Pokémon Vintage Jenga Card | Cheetos In",
    metaDescription: "Looking for the vintage Grimer (#088) from Pokémon? Get this classic Cheetos Jenga Card from India in Heavily Played condition. Perfect for collectors!",
    description: "Step back in time with this authentic Cheetos promotional Jenga Card featuring Grimer (#088) from Pokémon. Originally distributed in India, this collectible is a nostalgic piece of pop culture history. Condition is rated as Heavily Played. Ideal for display or completing your childhood collection.",
    condition: "Heavily Played",
    tags: "Grimer, Pokémon, Jenga Card, Cheetos, Vintage, India Collectible, Retro",
    shortDescription: "Vintage Grimer (#088) Jenga Card from the Pokémon promotional line by Cheetos.",
    character: "Grimer",
    itemType: "Jenga Card"
  },
  {
    name: "Voltorb (#100) - Pokémon Cheetos Jenga Card",
    slug: "voltorb-100-pokemon-jenga-card",
    metaTitle: "Buy Voltorb (#100) Pokémon Vintage Jenga Card | Cheetos I",
    metaDescription: "Looking for the vintage Voltorb (#100) from Pokémon? Get this classic Cheetos Jenga Card from India in Heavily Played condition. Perfect for collectors!",
    description: "Step back in time with this authentic Cheetos promotional Jenga Card featuring Voltorb (#100) from Pokémon. Originally distributed in India, this collectible is a nostalgic piece of pop culture history. Condition is rated as Heavily Played. Ideal for display or completing your childhood collection.",
    condition: "Heavily Played",
    tags: "Voltorb, Pokémon, Jenga Card, Cheetos, Vintage, India Collectible, Retro",
    shortDescription: "Vintage Voltorb (#100) Jenga Card from the Pokémon promotional line by Cheetos.",
    character: "Voltorb",
    itemType: "Jenga Card"
  },
  {
    name: "Golbat (#042) - Pokémon Cheetos Jenga Card",
    slug: "golbat-042-pokemon-jenga-card",
    metaTitle: "Buy Golbat (#042) Pokémon Vintage Jenga Card | Cheetos In",
    metaDescription: "Looking for the vintage Golbat (#042) from Pokémon? Get this classic Cheetos Jenga Card from India in Heavily Played condition. Perfect for collectors!",
    description: "Step back in time with this authentic Cheetos promotional Jenga Card featuring Golbat (#042) from Pokémon. Originally distributed in India, this collectible is a nostalgic piece of pop culture history. Condition is rated as Heavily Played. Ideal for display or completing your childhood collection.",
    condition: "Heavily Played",
    tags: "Golbat, Pokémon, Jenga Card, Cheetos, Vintage, India Collectible, Retro",
    shortDescription: "Vintage Golbat (#042) Jenga Card from the Pokémon promotional line by Cheetos.",
    character: "Golbat",
    itemType: "Jenga Card"
  },
  {
    name: "Omastar (#139) - Pokémon Cheetos Jenga Card",
    slug: "omastar-139-pokemon-jenga-card",
    metaTitle: "Buy Omastar (#139) Pokémon Vintage Jenga Card | Cheetos I",
    metaDescription: "Looking for the vintage Omastar (#139) from Pokémon? Get this classic Cheetos Jenga Card from India in Heavily Played condition. Perfect for collectors!",
    description: "Step back in time with this authentic Cheetos promotional Jenga Card featuring Omastar (#139) from Pokémon. Originally distributed in India, this collectible is a nostalgic piece of pop culture history. Condition is rated as Heavily Played. Ideal for display or completing your childhood collection.",
    condition: "Heavily Played",
    tags: "Omastar, Pokémon, Jenga Card, Cheetos, Vintage, India Collectible, Retro",
    shortDescription: "Vintage Omastar (#139) Jenga Card from the Pokémon promotional line by Cheetos.",
    character: "Omastar",
    itemType: "Jenga Card"
  },
  {
    name: "Hitmonlee (#106) - Pokémon Cheetos Jenga Card",
    slug: "hitmonlee-106-pokemon-jenga-card",
    metaTitle: "Buy Hitmonlee (#106) Pokémon Vintage Jenga Card | Cheetos",
    metaDescription: "Looking for the vintage Hitmonlee (#106) from Pokémon? Get this classic Cheetos Jenga Card from India in Heavily Played condition. Perfect for collectors!",
    description: "Step back in time with this authentic Cheetos promotional Jenga Card featuring Hitmonlee (#106) from Pokémon. Originally distributed in India, this collectible is a nostalgic piece of pop culture history. Condition is rated as Heavily Played. Ideal for display or completing your childhood collection.",
    condition: "Heavily Played",
    tags: "Hitmonlee, Pokémon, Jenga Card, Cheetos, Vintage, India Collectible, Retro",
    shortDescription: "Vintage Hitmonlee (#106) Jenga Card from the Pokémon promotional line by Cheetos.",
    character: "Hitmonlee",
    itemType: "Jenga Card"
  }
];

async function main() {
  const categoryId = "cmr9gnp4x0000wrrftla568zy"; // Pokémon category
  
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
      itemType: item.itemType,
      country: "India",
      rarity: "Rare" // Using "Rare" as default for vintage promos if unspecified
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
          coverImage: "", 
          askingPrice: 500,
          fairValueMin: 400,
          fairValueMax: 800,
          character: item.character,
          manufacturer: "Cheetos",
          series: "Pokémon Promos",
          releaseYear: 2003, // Standard year for Pokemon Cheetos promos
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
