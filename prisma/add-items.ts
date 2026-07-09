import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const itemsToAdd = [
  {
    name: "Ariel (No. 16) - Beyblade Cheetos Spinner",
    slug: "ariel-16-beyblade-spinner",
    metaTitle: "Buy Ariel (No. 16) Beyblade Vintage Spinner | Cheetos India",
    metaDescription: "Looking for the vintage Ariel (No. 16) from Beyblade? Get this classic Cheetos Spinner from India in Moderately Played condition. Perfect for collectors!",
    description: "Step back in time with this authentic Cheetos promotional Spinner featuring Ariel (No. 16) from Beyblade. Originally distributed in India, this collectible is a nostalgic piece of pop culture history. Condition is rated as Moderately Played. Ideal for display or completing your childhood collection.",
    shortDesc: "Vintage Ariel (No. 16) Spinner from the Beyblade promotional line by Cheetos.",
    tags: ["Ariel", "Beyblade", "Spinner", "Cheetos", "Vintage", "India Collectible", "Retro"],
    quantity: 1
  },
  {
    name: "Driger (No. 25) - Beyblade Cheetos Spinner",
    slug: "driger-25-beyblade-spinner",
    metaTitle: "Buy Driger (No. 25) Beyblade Vintage Spinner | Cheetos India",
    metaDescription: "Looking for the vintage Driger (No. 25) from Beyblade? Get this classic Cheetos Spinner from India in Moderately Played condition. Perfect for collectors!",
    description: "Step back in time with this authentic Cheetos promotional Spinner featuring Driger (No. 25) from Beyblade. Originally distributed in India, this collectible is a nostalgic piece of pop culture history. Condition is rated as Moderately Played. Ideal for display or completing your childhood collection.",
    shortDesc: "Vintage Driger (No. 25) Spinner from the Beyblade promotional line by Cheetos.",
    tags: ["Driger", "Beyblade", "Spinner", "Cheetos", "Vintage", "India Collectible", "Retro"],
    quantity: 2
  },
  {
    name: "Driger (No. 04) - Beyblade Cheetos Spinner",
    slug: "driger-04-beyblade-spinner",
    metaTitle: "Buy Driger (No. 04) Beyblade Vintage Spinner | Cheetos India",
    metaDescription: "Looking for the vintage Driger (No. 04) from Beyblade? Get this classic Cheetos Spinner from India in Moderately Played condition. Perfect for collectors!",
    description: "Step back in time with this authentic Cheetos promotional Spinner featuring Driger (No. 04) from Beyblade. Originally distributed in India, this collectible is a nostalgic piece of pop culture history. Condition is rated as Moderately Played. Ideal for display or completing your childhood collection.",
    shortDesc: "Vintage Driger (No. 04) Spinner from the Beyblade promotional line by Cheetos.",
    tags: ["Driger", "Beyblade", "Spinner", "Cheetos", "Vintage", "India Collectible", "Retro"],
    quantity: 1
  },
  {
    name: "Dragoon (No. 39) - Beyblade Cheetos Spinner",
    slug: "dragoon-39-beyblade-spinner",
    metaTitle: "Buy Dragoon (No. 39) Beyblade Vintage Spinner | Cheetos India",
    metaDescription: "Looking for the vintage Dragoon (No. 39) from Beyblade? Get this classic Cheetos Spinner from India in Moderately Played condition. Perfect for collectors!",
    description: "Step back in time with this authentic Cheetos promotional Spinner featuring Dragoon (No. 39) from Beyblade. Originally distributed in India, this collectible is a nostalgic piece of pop culture history. Condition is rated as Moderately Played. Ideal for display or completing your childhood collection.",
    shortDesc: "Vintage Dragoon (No. 39) Spinner from the Beyblade promotional line by Cheetos.",
    tags: ["Dragoon", "Beyblade", "Spinner", "Cheetos", "Vintage", "India Collectible", "Retro"],
    quantity: 1
  },
  {
    name: "Tyson (No. 30) - Beyblade Cheetos Spinner",
    slug: "tyson-30-beyblade-spinner",
    metaTitle: "Buy Tyson (No. 30) Beyblade Vintage Spinner | Cheetos India",
    metaDescription: "Looking for the vintage Tyson (No. 30) from Beyblade? Get this classic Cheetos Spinner from India in Moderately Played condition. Perfect for collectors!",
    description: "Step back in time with this authentic Cheetos promotional Spinner featuring Tyson (No. 30) from Beyblade. Originally distributed in India, this collectible is a nostalgic piece of pop culture history. Condition is rated as Moderately Played. Ideal for display or completing your childhood collection.",
    shortDesc: "Vintage Tyson (No. 30) Spinner from the Beyblade promotional line by Cheetos.",
    tags: ["Tyson", "Beyblade", "Spinner", "Cheetos", "Vintage", "India Collectible", "Retro"],
    quantity: 1
  },
  {
    name: "Sharkrash (No. 09) - Beyblade Cheetos Spinner",
    slug: "sharkrash-09-beyblade-spinner",
    metaTitle: "Buy Sharkrash (No. 09) Beyblade Vintage Spinner | Cheetos In",
    metaDescription: "Looking for the vintage Sharkrash (No. 09) from Beyblade? Get this classic Cheetos Spinner from India in Moderately Played condition. Perfect for collectors!",
    description: "Step back in time with this authentic Cheetos promotional Spinner featuring Sharkrash (No. 09) from Beyblade. Originally distributed in India, this collectible is a nostalgic piece of pop culture history. Condition is rated as Moderately Played. Ideal for display or completing your childhood collection.",
    shortDesc: "Vintage Sharkrash (No. 09) Spinner from the Beyblade promotional line by Cheetos.",
    tags: ["Sharkrash", "Beyblade", "Spinner", "Cheetos", "Vintage", "India Collectible", "Retro"],
    quantity: 1
  },
  {
    name: "Dranzer (No. 22) - Beyblade Cheetos Spinner",
    slug: "dranzer-22-beyblade-spinner",
    metaTitle: "Buy Dranzer (No. 22) Beyblade Vintage Spinner | Cheetos India",
    metaDescription: "Looking for the vintage Dranzer (No. 22) from Beyblade? Get this classic Cheetos Spinner from India in Moderately Played condition. Perfect for collectors!",
    description: "Step back in time with this authentic Cheetos promotional Spinner featuring Dranzer (No. 22) from Beyblade. Originally distributed in India, this collectible is a nostalgic piece of pop culture history. Condition is rated as Moderately Played. Ideal for display or completing your childhood collection.",
    shortDesc: "Vintage Dranzer (No. 22) Spinner from the Beyblade promotional line by Cheetos.",
    tags: ["Dranzer", "Beyblade", "Spinner", "Cheetos", "Vintage", "India Collectible", "Retro"],
    quantity: 1
  }
];

function generateSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function main() {
  const category = await prisma.category.findUnique({
    where: { slug: 'beyblade' }
  });

  if (!category) {
    throw new Error('Beyblade category not found!');
  }

  for (let i = 0; i < itemsToAdd.length; i++) {
    const itemData = itemsToAdd[i];
    
    // Create random SKU
    const sku = `NB57-BEY-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create item
    const createdItem = await prisma.item.upsert({
      where: { slug: itemData.slug },
      update: {},
      create: {
        sku: sku,
        slug: itemData.slug,
        name: itemData.name,
        description: `<p><strong>${itemData.shortDesc}</strong></p><p>${itemData.description}</p>`,
        categoryId: category.id,
        condition: 'Played',
        quantity: itemData.quantity,
        coverImage: '',
        metaTitle: itemData.metaTitle,
        metaDescription: itemData.metaDescription,
      }
    });

    console.log(`Created item: ${createdItem.name}`);

    // Process Tags
    for (const tagName of itemData.tags) {
      const tagSlug = generateSlug(tagName);
      
      let tag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
      if (!tag) {
        tag = await prisma.tag.create({
          data: { name: tagName, slug: tagSlug }
        });
      }

      // Link tag to item
      await prisma.itemTag.upsert({
        where: {
          itemId_tagId: {
            itemId: createdItem.id,
            tagId: tag.id
          }
        },
        update: {},
        create: {
          itemId: createdItem.id,
          tagId: tag.id
        }
      });
    }
  }

  console.log('Finished inserting all items successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
