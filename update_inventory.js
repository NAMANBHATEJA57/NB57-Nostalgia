const { PrismaClient } = require('@prisma/client');
const xlsx = require('xlsx');

const prisma = new PrismaClient();

async function main() {
  console.log("Reading XLSX file...");
  const wb = xlsx.readFile('NB57_Inventory_Update_Filled.xlsx');
  const sheetName = wb.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);

  console.log(`Found ${data.length} rows to update.`);
  let updatedCount = 0;
  let notFoundCount = 0;

  for (const row of data) {
    const slug = row['Slug'];
    if (!slug) continue;
    
    console.log(`Processing: ${slug}`);

    const existingItem = await prisma.item.findUnique({ where: { slug } });
    if (!existingItem) {
      console.log(`[WARN] Item not found for slug: ${slug}`);
      notFoundCount++;
      continue;
    }

    // Parse Fair Value
    let fvMin = null;
    let fvMax = null;
    if (row['Fair Value (INR)']) {
      const parts = String(row['Fair Value (INR)']).split('-');
      if (parts.length === 2) {
        fvMin = parseFloat(parts[0].trim());
        fvMax = parseFloat(parts[1].trim());
      } else {
        fvMin = parseFloat(parts[0].trim());
        fvMax = fvMin;
      }
    }

    let specs = {};
    try {
      if (existingItem.specifications) {
        specs = JSON.parse(existingItem.specifications);
      }
    } catch (e) {}

    specs.shortDescription = row['Short Description'];
    specs.country = row['Country'];
    specs.rarity = row['Rarity'];
    specs.itemType = row['Item Type'];

    // Handle Tags
    const tags = row['Tags'] ? row['Tags'].split(',').map(t => t.trim()).filter(t => t) : [];

    const updateData = {
      name: row['Title'] || existingItem.name,
      series: row['Series'] || existingItem.series,
      manufacturer: row['Franchise'] || existingItem.manufacturer,
      character: row['Character'] || existingItem.character,
      condition: row['Condition'] || existingItem.condition,
      sealed: row['Sealed'] === 'Yes',
      fairValueMin: isNaN(fvMin) ? existingItem.fairValueMin : fvMin,
      fairValueMax: isNaN(fvMax) ? existingItem.fairValueMax : fvMax,
      highestSeenPrice: row['Highest Seen (INR)'] ? parseFloat(row['Highest Seen (INR)']) : existingItem.highestSeenPrice,
      askingPrice: row['Asking Price (INR)'] ? parseFloat(row['Asking Price (INR)']) : existingItem.askingPrice,
      priceConfidence: row['Price Confidence'] || existingItem.priceConfidence,
      metaTitle: row['SEO Title'] || existingItem.metaTitle,
      metaDescription: row['Meta Description'] || existingItem.metaDescription,
      description: row['Long Description'] || existingItem.description,
      releaseYear: row['Release'] ? parseInt(row['Release'], 10) : existingItem.releaseYear,
      notes: row['Notes'] || existingItem.notes,
      specifications: JSON.stringify(specs)
    };

    if (row['Rarity']) {
       const rareStr = String(row['Rarity']).toLowerCase();
       updateData.rare = rareStr.includes('rare') && !rareStr.includes('common');
    }

    try {
      await prisma.item.update({
        where: { id: existingItem.id },
        data: updateData
      });
      
      // Update Tags if needed
      for (const t of tags) {
        const tagSlug = t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        if (!tagSlug) continue;
        
        let tagRecord = await prisma.tag.findUnique({ where: { slug: tagSlug } });
        if (!tagRecord) {
          tagRecord = await prisma.tag.create({ data: { name: t, slug: tagSlug } });
        }
        
        const existingLink = await prisma.itemTag.findUnique({
           where: { itemId_tagId: { itemId: existingItem.id, tagId: tagRecord.id } }
        });
        if (!existingLink) {
           await prisma.itemTag.create({
             data: { itemId: existingItem.id, tagId: tagRecord.id }
           });
        }
      }

      updatedCount++;
    } catch (err) {
      console.error(`[ERROR] Failed to update item ${slug}:`, err.message);
    }
  }

  console.log(`\nUpdate Complete!`);
  console.log(`Successfully updated: ${updatedCount}`);
  console.log(`Not found: ${notFoundCount}`);
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
