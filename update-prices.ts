import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const csvFilePath = path.join(process.cwd(), 'NB57_Final_Item_Prices.csv');
  const csvData = fs.readFileSync(csvFilePath, 'utf8');

  // Simple CSV parser
  const lines = csvData.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const headers = lines[0].split(',');
  const updates = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Split by the LAST comma, because some item names might have commas.
    // E.g., "Item Name, 123", price is 123.
    let name = '';
    let priceStr = '';
    
    if (line.includes('",')) {
      const parts = line.split('",');
      name = parts[0].replace(/^"/, '');
      priceStr = parts[1];
    } else {
      const lastCommaIdx = line.lastIndexOf(',');
      if (lastCommaIdx !== -1) {
        name = line.substring(0, lastCommaIdx).trim();
        priceStr = line.substring(lastCommaIdx + 1).trim();
      } else {
        console.log(`Skipping line due to missing comma: ${line}`);
        continue;
      }
    }

    // handle quotes around name just in case
    if (name.startsWith('"') && name.endsWith('"')) {
      name = name.slice(1, -1);
    }
    
    // Some lines have extra quotes, like: "2005 Haldiram's ""S.K.I.D.Z"" Boleto Tazo no 31 - Promotional Collectible"
    name = name.replace(/""/g, '"');

    const price = parseInt(priceStr.replace(/,/g, ''), 10);

    if (name && !isNaN(price)) {
      updates.push({ name, price });
    }
  }

  console.log(`Found ${updates.length} price records in CSV.`);

  const items = await prisma.item.findMany();
  let updatedCount = 0;
  let notFound = [];

  for (const update of updates) {
    const matchingItems = items.filter(i => {
      // normalize spaces (e.g. double spaces in CSV vs DB)
      const n1 = i.name.replace(/\s+/g, ' ').trim().toLowerCase();
      const n2 = update.name.replace(/\s+/g, ' ').trim().toLowerCase();
      return n1 === n2;
    });

    if (matchingItems.length > 0) {
      for (const item of matchingItems) {
        await prisma.item.update({
          where: { id: item.id },
          data: { askingPrice: update.price }
        });
        updatedCount++;
      }
    } else {
      notFound.push(update.name);
    }
  }

  console.log(`Updated ${updatedCount} items.`);
  if (notFound.length > 0) {
    console.log(`Could not find ${notFound.length} items in DB (first 5: ${notFound.slice(0,5).join(' | ')})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
