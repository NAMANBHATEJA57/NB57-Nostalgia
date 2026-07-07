export {};
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  { name: 'Pokemon', slug: 'pokemon', description: 'Everything about Pokemon Tazos, Cards, and Collectibles.' },
  { name: 'Yu-Gi-Oh!', slug: 'yu-gi-oh', description: 'Guides for Yu-Gi-Oh cards and promotional merchandise.' },
  { name: 'Bakugan', slug: 'bakugan', description: 'Checklists and history of Bakugan toys in India.' },
  { name: 'Ben 10', slug: 'ben-10', description: 'Rare Ben 10 merchandise and collector guides.' },
  { name: 'Cartoon Network', slug: 'cartoon-network', description: 'Promotional toys from the classic CN era.' },
  { name: 'WWE', slug: 'wwe', description: 'Wrestling cards and merchandise guides.' },
  { name: 'Marvel', slug: 'marvel', description: 'Marvel collectibles and cards.' },
  { name: 'DC', slug: 'dc', description: 'DC comics collectibles and merchandise.' },
  { name: 'Tazos', slug: 'tazos', description: 'The ultimate database for Frito-Lay Tazos.' },
  { name: 'Trading Cards', slug: 'trading-cards', description: 'Guides for all vintage trading card sets.' },
  { name: 'Buying Guides', slug: 'buying-guides', description: 'What to look for when buying vintage items.' },
  { name: 'Price Guides', slug: 'price-guides', description: 'Valuation and historical pricing for items.' },
  { name: 'Restoration', slug: 'restoration', description: 'How to clean and restore your collectibles.' },
  { name: 'Fake vs Original', slug: 'fake-vs-original', description: 'How to spot counterfeit items.' }
];

const articles = [
  { title: 'How to Identify Original Cheetos Pokémon Tazos', cat: 'pokemon' },
  { title: 'Complete Guide to Pokémon Flip Cards in India', cat: 'pokemon' },
  { title: 'Rare Ben 10 Cheetos Collectibles Explained', cat: 'ben-10' },
  { title: 'Bakugan Promotional Merchandise Checklist', cat: 'bakugan' },
  { title: 'History of Pokémon Tazos in India', cat: 'pokemon' },
  { title: 'Yu-Gi-Oh! Cheetos Shooter Tazos Guide', cat: 'yu-gi-oh' },
  { title: 'Factory Sealed vs Opened Collectibles', cat: 'buying-guides' },
  { title: 'How to Store Vintage Plastic Tazos', cat: 'restoration' },
  { title: 'Most Valuable Indian Cheetos Collectibles', cat: 'price-guides' },
  { title: 'Rare Cartoon Network Cheetos Promotions', cat: 'cartoon-network' },
  { title: 'Beginner\'s Guide to Collecting Tazos', cat: 'tazos' },
  { title: 'Fake vs Original Pokémon Tazos', cat: 'fake-vs-original' },
  { title: 'Indian Collectibles Worth Buying in 2026', cat: 'buying-guides' },
  { title: 'How to Price Vintage Collectibles', cat: 'price-guides' },
  { title: 'Complete Ben 10 Collectibles Checklist', cat: 'ben-10' },
  { title: 'Rare Pokémon Promotional Merchandise in India', cat: 'pokemon' },
  { title: 'How to Photograph Collectibles for Selling', cat: 'buying-guides' },
  { title: 'Understanding Collectible Condition Grades', cat: 'buying-guides' },
  { title: 'Building a Vintage Collection on a Budget', cat: 'buying-guides' },
  { title: 'The History of Cheetos Promotional Collectibles in India', cat: 'history' }
];

async function main() {
  console.log('Seeding Blog Categories...');
  for (const cat of categories) {
    await prisma.blogCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description
      }
    });
  }

  const allCategories = await prisma.blogCategory.findMany();

  console.log('Seeding Blog Posts...');
  for (const article of articles) {
    const category = allCategories.find((c: any) => c.slug === article.cat) || allCategories[0];
    const slug = article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    await prisma.blogPost.upsert({
      where: { slug },
      update: {},
      create: {
        title: article.title,
        slug,
        excerpt: 'This is a placeholder article for ' + article.title,
        content: '<p>This is a placeholder for the article: <strong>' + article.title + '</strong>. Content will be added manually via the Admin Dashboard.</p>',
        author: "NB57's Nostalgia",
        status: 'Draft',
        categoryId: category.id,
        schemaType: 'Article',
      }
    });
  }

  console.log('Blog seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
