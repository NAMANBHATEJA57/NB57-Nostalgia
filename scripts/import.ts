import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

const prisma = new PrismaClient();

async function main() {
  const csvFilePath = path.join(process.cwd(), 'NB57_Nostalgia_Master_Inventory_v1.csv');
  const csvData = fs.readFileSync(csvFilePath, 'utf8');

  const parsed = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
  });

  console.log(`Found ${parsed.data.length} records to import`);

  let count = 0;
  for (const row of parsed.data as any[]) {
    // sku: NB57-0001
    const sku = row['Collection ID']?.trim();
    if (!sku) continue;

    const name = row['Item Name']?.trim() || 'Unknown Item';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + sku.toLowerCase();
    
    // Category
    const categoryName = row['Category']?.trim() || 'Uncategorized';
    const categorySlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Upsert Category
    const category = await prisma.category.upsert({
      where: { slug: categorySlug },
      update: {},
      create: {
        name: categoryName,
        slug: categorySlug,
      }
    });

    // Tags
    const tagsStr = row['Tags'] || '';
    const tagsList = tagsStr.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
    const tagConnections = [];
    for (const tagName of tagsList) {
      const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const tag = await prisma.tag.upsert({
        where: { slug: tagSlug },
        update: {},
        create: {
          name: tagName,
          slug: tagSlug,
        }
      });
      tagConnections.push({
        tagId: tag.id
      });
    }

    const price = parseFloat(row['Asking Price']);
    const askingPrice = isNaN(price) ? null : price;

    const fairVal = parseFloat(row['Fair Value']);
    const fairValueMin = isNaN(fairVal) ? null : fairVal;
    
    const quantity = parseInt(row['Quantity'], 10) || 1;
    const releaseYear = parseInt(row['Release Year'], 10);

    const condition = row['Condition']?.trim() || 'Unknown';
    const availability = row['Availability']?.trim() || 'Available';
    const description = row['Description']?.trim() || '';
    const notes = row['Notes']?.trim() || '';
    
    // images
    const coverImage = row['Cover Image']?.trim() || 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=800';

    const featured = row['Featured']?.trim().toLowerCase() === 'yes' || row['Featured'] === 'TRUE';
    const sealed = row['Sealed']?.trim().toLowerCase() === 'yes' || row['Sealed'] === 'TRUE';
    const rare = row['Rare']?.trim().toLowerCase() === 'yes' || row['Rare'] === 'TRUE';

    try {
      await prisma.item.upsert({
        where: { sku: sku },
        update: {
          name,
          slug,
          categoryId: category.id,
          subcategory: row['Subcategory']?.trim() || null,
          series: row['Series']?.trim() || null,
          character: row['Character']?.trim() || null,
          manufacturer: row['Manufacturer']?.trim() || null,
          releaseYear: isNaN(releaseYear) ? null : releaseYear,
          condition,
          availability,
          askingPrice,
          fairValueMin,
          fairValueMax: fairValueMin,
          description,
          notes,
          quantity,
          coverImage,
          featured,
          sealed,
          rare,
          itemTags: {
            deleteMany: {},
            create: tagConnections
          }
        },
        create: {
          sku,
          name,
          slug,
          categoryId: category.id,
          subcategory: row['Subcategory']?.trim() || null,
          series: row['Series']?.trim() || null,
          character: row['Character']?.trim() || null,
          manufacturer: row['Manufacturer']?.trim() || null,
          releaseYear: isNaN(releaseYear) ? null : releaseYear,
          condition,
          availability,
          askingPrice,
          fairValueMin,
          fairValueMax: fairValueMin,
          description,
          notes,
          quantity,
          coverImage,
          featured,
          sealed,
          rare,
          itemTags: {
            create: tagConnections
          }
        }
      });
      count++;
      console.log(`[${count}/${parsed.data.length}] Upserted ${sku} - ${name}`);
    } catch (e) {
      console.error(`Failed to upsert ${sku} - ${name}`, e);
    }
  }

  console.log(`Successfully imported ${count} items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
