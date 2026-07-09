import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const POKEMON_CATEGORY_ID = 'cmr9gnp4x0000wrrftla568zy';
const START_SKU = 112; // NB57-0112 onwards

const itemsToAdd = [
  {
    name: "Omastar (#139) - Pokémon Cheetos Square 3D Card",
    slug: "omastar-139-pokemon-square-3d-card",
    metaTitle: "Buy Omastar (#139) Pokémon Vintage Square 3D Card | Cheetos India",
    metaDescription: "Looking for the rare vintage Omastar (#139) from Pokémon? Get this authentic Cheetos Square 3D holographic card from India in Played condition.",
    shortDesc: "Vintage Omastar (#139) interactive lenticular Square 3D card from the early 2000s Cheetos India promotional lineup.",
    description: "Bring back your childhood memories with this ultra-nostalgic, authentic Cheetos promotional Square 3D motion card featuring Omastar (#139). Released as a limited snack premium in India during the height of the early 2000s Pokémon craze, this lenticular card flips between dynamic action frames when tilted. This collectible card is preserved in Played condition with a gorgeous retro shine. A must-have centerpiece to complete your vintage Indian promotional archive!",
    tags: ["Omastar", "#139", "Pokémon", "Square 3D Card", "Lenticular", "Cheetos Promos", "Vintage India", "2000s Nostalgia", "Retro Snack Toy"],
    condition: "Played",
    availability: "Available",
    askingPrice: 169,
    character: "Omastar",
    series: "Pokémon",
  },
  {
    name: "Goldeen (#118) - Pokémon Cheetos Square 3D Card",
    slug: "goldeen-118-pokemon-square-3d-card",
    metaTitle: "Buy Goldeen (#118) Pokémon Vintage Square 3D Card | Cheetos India",
    metaDescription: "Looking for the rare vintage Goldeen (#118) from Pokémon? Get this authentic Cheetos Square 3D holographic card from India in Played condition.",
    shortDesc: "Vintage Goldeen (#118) interactive lenticular Square 3D card from the early 2000s Cheetos India promotional lineup.",
    description: "Bring back your childhood memories with this ultra-nostalgic, authentic Cheetos promotional Square 3D motion card featuring Goldeen (#118). Released as a limited snack premium in India during the height of the early 2000s Pokémon craze, this lenticular card flips between dynamic action frames when tilted. This collectible card is preserved in Played condition with a gorgeous retro shine. A must-have centerpiece to complete your vintage Indian promotional archive!",
    tags: ["Goldeen", "#118", "Pokémon", "Square 3D Card", "Lenticular", "Cheetos Promos", "Vintage India", "2000s Nostalgia", "Retro Snack Toy"],
    condition: "Played",
    availability: "Available",
    askingPrice: 169,
    character: "Goldeen",
    series: "Pokémon",
  },
  {
    name: "Gyarados (#130) - Pokémon Cheetos Square 3D Card",
    slug: "gyarados-130-pokemon-square-3d-card",
    metaTitle: "Buy Gyarados (#130) Pokémon Vintage Square 3D Card | Cheetos India",
    metaDescription: "Looking for the rare vintage Gyarados (#130) from Pokémon? Get this authentic Cheetos Square 3D holographic card from India in Played condition.",
    shortDesc: "Vintage Gyarados (#130) interactive lenticular Square 3D card from the early 2000s Cheetos India promotional lineup.",
    description: "Bring back your childhood memories with this ultra-nostalgic, authentic Cheetos promotional Square 3D motion card featuring Gyarados (#130). Released as a limited snack premium in India during the height of the early 2000s Pokémon craze, this lenticular card flips between dynamic action frames when tilted. This collectible card is preserved in Played condition with a gorgeous retro shine. A must-have centerpiece to complete your vintage Indian promotional archive!",
    tags: ["Gyarados", "#130", "Pokémon", "Square 3D Card", "Lenticular", "Cheetos Promos", "Vintage India", "2000s Nostalgia", "Retro Snack Toy"],
    condition: "Played",
    availability: "Available",
    askingPrice: 169,
    character: "Gyarados",
    series: "Pokémon",
  },
  {
    name: "Seaking (#119) - Pokémon Cheetos Square 3D Card",
    slug: "seaking-119-pokemon-square-3d-card",
    metaTitle: "Buy Seaking (#119) Pokémon Vintage Square 3D Card | Cheetos India",
    metaDescription: "Looking for the rare vintage Seaking (#119) from Pokémon? Get this authentic Cheetos Square 3D holographic card from India in Played condition.",
    shortDesc: "Vintage Seaking (#119) interactive lenticular Square 3D card from the early 2000s Cheetos India promotional lineup.",
    description: "Bring back your childhood memories with this ultra-nostalgic, authentic Cheetos promotional Square 3D motion card featuring Seaking (#119). Released as a limited snack premium in India during the height of the early 2000s Pokémon craze, this lenticular card flips between dynamic action frames when tilted. This collectible card is preserved in Played condition with a gorgeous retro shine. A must-have centerpiece to complete your vintage Indian promotional archive!",
    tags: ["Seaking", "#119", "Pokémon", "Square 3D Card", "Lenticular", "Cheetos Promos", "Vintage India", "2000s Nostalgia", "Retro Snack Toy"],
    condition: "Played",
    availability: "Available",
    askingPrice: 169,
    character: "Seaking",
    series: "Pokémon",
  },
  {
    name: "Kingler (#099) - Pokémon Cheetos Square 3D Card",
    slug: "kingler-099-pokemon-square-3d-card",
    metaTitle: "Buy Kingler (#099) Pokémon Vintage Square 3D Card | Cheetos India",
    metaDescription: "Looking for the rare vintage Kingler (#099) from Pokémon? Get this authentic Cheetos Square 3D holographic card from India in Played condition.",
    shortDesc: "Vintage Kingler (#099) interactive lenticular Square 3D card from the early 2000s Cheetos India promotional lineup.",
    description: "Bring back your childhood memories with this ultra-nostalgic, authentic Cheetos promotional Square 3D motion card featuring Kingler (#099). Released as a limited snack premium in India during the height of the early 2000s Pokémon craze, this lenticular card flips between dynamic action frames when tilted. This collectible card is preserved in Played condition with a gorgeous retro shine. A must-have centerpiece to complete your vintage Indian promotional archive!",
    tags: ["Kingler", "#099", "Pokémon", "Square 3D Card", "Lenticular", "Cheetos Promos", "Vintage India", "2000s Nostalgia", "Retro Snack Toy"],
    condition: "Played",
    availability: "Available",
    askingPrice: 169,
    character: "Kingler",
    series: "Pokémon",
  },
  {
    name: "Blastoise (#009) - Pokémon Cheetos Square 3D Card",
    slug: "blastoise-009-pokemon-square-3d-card",
    metaTitle: "Blastoise (#009) Pokémon Vintage Square 3D Card | Archive",
    metaDescription: "View the rare vintage Blastoise (#009) from Pokémon. An authentic Cheetos Square 3D holographic card from India in Played condition. Not for sale.",
    shortDesc: "Vintage Blastoise (#009) interactive lenticular Square 3D card from the early 2000s Cheetos India promotional lineup.",
    description: "Bring back your childhood memories with this ultra-nostalgic, authentic Cheetos promotional Square 3D motion card featuring Blastoise (#009). Released as a limited snack premium in India during the height of the early 2000s Pokémon craze, this lenticular card flips between dynamic action frames when tilted. This collectible card is preserved in Played condition with a gorgeous retro shine. Please note: This item is part of a private archive and is currently not for sale.",
    tags: ["Blastoise", "#009", "Pokémon", "Square 3D Card", "Lenticular", "Cheetos Promos", "Vintage India", "2000s Nostalgia", "Retro Snack Toy", "Archive Collection"],
    condition: "Played",
    availability: "Not For Sale",
    askingPrice: 0,
    character: "Blastoise",
    series: "Pokémon",
  },
];

function generateSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function main() {
  console.log(`Adding ${itemsToAdd.length} Square 3D Card items to Pokemon category...`);

  for (let i = 0; i < itemsToAdd.length; i++) {
    const itemData = itemsToAdd[i];
    const skuNum = START_SKU + i;
    const sku = `NB57-${String(skuNum).padStart(4, '0')}`;

    const createdItem = await prisma.item.upsert({
      where: { slug: itemData.slug },
      update: {},
      create: {
        sku,
        slug: itemData.slug,
        name: itemData.name,
        description: `${itemData.shortDesc} ${itemData.description}`,
        categoryId: POKEMON_CATEGORY_ID,
        condition: itemData.condition,
        availability: itemData.availability,
        askingPrice: itemData.askingPrice > 0 ? itemData.askingPrice : null,
        character: itemData.character,
        series: itemData.series,
        country: 'India',
        manufacturer: 'Cheetos / Frito-Lay',
        subcategory: 'Square 3D Card',
        quantity: 1,
        coverImage: '',
        metaTitle: itemData.metaTitle,
        metaDescription: itemData.metaDescription,
        promo: true,
        recentlyAdded: true,
      }
    });

    console.log(`✅ Created: ${createdItem.name} (SKU: ${sku})`);

    // Process Tags
    for (const tagName of itemData.tags) {
      const tagSlug = generateSlug(tagName);

      let tag = await prisma.tag.findUnique({ where: { slug: tagSlug } });
      if (!tag) {
        tag = await prisma.tag.create({
          data: { name: tagName, slug: tagSlug }
        });
        console.log(`   🏷️  Created tag: ${tagName}`);
      }

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

  console.log('\n🎉 Finished inserting all Square 3D Card items successfully!');
  
  // Verify
  const count = await prisma.item.count();
  console.log(`📊 Total items in database: ${count}`);
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
