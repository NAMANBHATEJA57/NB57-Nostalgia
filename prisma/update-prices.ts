import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const updates = [
  { slug: "ariel-16-beyblade-spinner", condition: "Played", price: 99 },
  { slug: "driger-25-beyblade-spinner", condition: "Played", price: 99 },
  { slug: "driger-04-beyblade-spinner", condition: "Played", price: 99 },
  { slug: "dragoon-39-beyblade-spinner", condition: "Good", price: 199 },
  { slug: "tyson-30-beyblade-spinner", condition: "Good", price: 199 },
  { slug: "sharkrash-09-beyblade-spinner", condition: "Played", price: 99 },
  { slug: "dranzer-22-beyblade-spinner", condition: "Good", price: 199 }
];

async function main() {
  for (const update of updates) {
    await prisma.item.updateMany({
      where: { slug: update.slug },
      data: { 
        askingPrice: update.price,
        condition: update.condition
      }
    });
    console.log(`Updated ${update.slug} to ${update.condition} - ₹${update.price}`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
