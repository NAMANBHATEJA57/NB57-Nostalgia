import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const yugiohCatId = 'cmr9gtzex005wwrrfi6khyxll';

  console.log('Deleting existing Yu-Gi-Oh items...');
  const deleted = await prisma.item.deleteMany({
    where: { categoryId: yugiohCatId }
  });
  console.log(`Deleted ${deleted.count} items.`);

  const inventory = [
    { title: 'Harpie Lady Sisters', number: '63', condition: 'Good', askingPrice: 399, fairValueMin: 250, fairValueMax: 600, character: 'Harpie Lady Sisters' },
    { title: 'Thousand Eyes Idol', number: '36', condition: 'Good', askingPrice: 399, fairValueMin: 250, fairValueMax: 600, character: 'Thousand Eyes Idol' },
    { title: 'Summoned Skull', number: '16', condition: 'Excellent', askingPrice: 499, fairValueMin: 350, fairValueMax: 700, character: 'Summoned Skull' },
    { title: 'Battle Steer', number: '26', condition: 'Good', askingPrice: 349, fairValueMin: 200, fairValueMax: 500, character: 'Battle Steer' },
    { title: 'Celtic Guardian', number: '11', condition: 'Good', askingPrice: 399, fairValueMin: 250, fairValueMax: 600, character: 'Celtic Guardian' },
    { title: 'Griffore', number: '38', condition: 'Good', askingPrice: 349, fairValueMin: 200, fairValueMax: 500, character: 'Griffore' },
    { title: 'Magician of Black Chaos', number: '14', condition: 'Good', askingPrice: 699, fairValueMin: 500, fairValueMax: 1200, character: 'Magician of Black Chaos' },
    { title: 'Magician of Black Chaos', number: '14', condition: 'Played', askingPrice: 499, fairValueMin: 300, fairValueMax: 900, character: 'Magician of Black Chaos', notes: 'Duplicate copy with more visible wear.' },
  ];

  for (let i = 0; i < inventory.length; i++) {
    const item = inventory[i];

    // Determine SKU
    const lastItem = await prisma.item.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { sku: true }
    });
    let nextNumber = 1;
    if (lastItem && lastItem.sku.startsWith('NB57-')) {
      const lastNumber = parseInt(lastItem.sku.split('-')[1], 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }
    const sku = `NB57-${nextNumber.toString().padStart(4, '0')}`;
    let slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    if (i === 7) {
        slug += '-fair'; // To avoid unique slug conflict for the duplicate Magician of Black Chaos
    }

    const description = `Tazo Number: ${item.number}\nBrand: Cheetos\nSeries: Yu-Gi-Oh!\nCountry: India\nType: Tazo${item.notes ? '\n\nNotes: ' + item.notes : ''}`;

    await prisma.item.create({
      data: {
        sku,
        slug,
        name: item.title,
        description,
        categoryId: yugiohCatId,
        subcategory: 'Tazo',
        series: 'Yu-Gi-Oh!',
        manufacturer: 'Cheetos',
        character: item.character,
        condition: item.condition,
        availability: 'Available',
        askingPrice: item.askingPrice,
        fairValueMin: item.fairValueMin,
        fairValueMax: item.fairValueMax,
        quantity: 1,
        coverImage: '',
        hideFromPublic: false,
        featured: false,
        sealed: false,
      }
    });
    console.log(`Created ${item.title} with SKU ${sku} and slug ${slug}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
