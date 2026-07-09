import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  let category = await prisma.category.findFirst({
    where: { name: { contains: 'Attax', mode: 'insensitive' } }
  });

  if (!category) {
    category = await prisma.category.findFirst();
  }
  
  if (!category) {
    console.error("No category found");
    return;
  }

  // Handle tags
  const tagNames = ["F1", "Formula 1", "Turbo Attax", "Topps", "Esteban Ocon", "Fernando Alonso", "Trading Cards", "Racing Collectibles", "Bundle Pack"];
  const tagIds = [];
  
  for (const t of tagNames) {
    const slug = t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { slug, name: t }
    });
    tagIds.push(tag.id);
  }

  const lastItem = await prisma.item.findFirst({
    orderBy: { sku: 'desc' },
    where: { sku: { startsWith: 'NB57-' } }
  });
  
  let newSku = "NB57-0001";
  if (lastItem && lastItem.sku) {
    const num = parseInt(lastItem.sku.replace("NB57-", ""));
    if (!isNaN(num)) {
      newSku = `NB57-${String(num + 1).padStart(4, '0')}`;
    }
  }

  const item = await prisma.item.create({
    data: {
      name: "Topps F1 & F2 Turbo Attax Card Bundle (8 Cards Pack)",
      slug: "topps-f1-f2-turbo-attax-card-bundle-8-pack",
      metaTitle: "Buy Topps F1 & F2 Turbo Attax Card Bundle (8 Cards) | Archive",
      metaDescription: "Get this exclusive 8-card bundle of Topps F1 & F2 Turbo Attax featuring Esteban Ocon, Fernando Alonso, and more in Played condition.",
      description: "Start or expand your racing collection with this 8-card bundle of Topps Formula 1 and Formula 2 Turbo Attax cards. The bundle includes high-octane Live Action cards, Track Masters, Speedsters, Pit Crew, and \"Stars of Tomorrow\" rookies. Key features include multiple Esteban Ocon variants and a Fernando Alonso Track Master card. Kept in standard Played condition, this bundle is perfect for motorsport enthusiasts and trading card players alike.",
      askingPrice: 79,
      categoryId: category.id,
      condition: "Played",
      availability: "Available",
      sku: newSku,
      coverImage: "/placeholder.png",
      itemTags: {
        create: tagIds.map(id => ({ tag: { connect: { id } } }))
      }
    }
  });

  console.log("Added item successfully:", item.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
