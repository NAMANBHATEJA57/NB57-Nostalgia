import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// A mapping of categories to relevant Unsplash images
const imageMap: Record<string, string> = {
  'pokemon': 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=1200&auto=format&fit=crop',
  'digimon': 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=1200&auto=format&fit=crop',
  'wwe': 'https://images.unsplash.com/photo-1517646331032-9e8563c520a1?q=80&w=1200&auto=format&fit=crop', 
  'beyblade': 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=1200&auto=format&fit=crop',
  'cartoon-network': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
  'default': 'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=1200&auto=format&fit=crop'
};

async function main() {
  const posts = await prisma.blogPost.findMany({
    include: { category: true }
  });

  for (const post of posts) {
    let imageUrl = imageMap[post.category.slug] || imageMap['default'];
    
    // Fine-tune based on title
    if (post.title.toLowerCase().includes('card') || post.title.toLowerCase().includes('jenga')) {
       imageUrl = 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=1200&auto=format&fit=crop';
    } else if (post.title.toLowerCase().includes('tazo') || post.title.toLowerCase().includes('beyblade')) {
       imageUrl = 'https://images.unsplash.com/photo-1611604548018-d56bbd85d681?q=80&w=1200&auto=format&fit=crop';
    } else if (post.title.toLowerCase().includes('wwe')) {
       imageUrl = 'https://images.unsplash.com/photo-1517646331032-9e8563c520a1?q=80&w=1200&auto=format&fit=crop';
    }

    await prisma.blogPost.update({
      where: { id: post.id },
      data: { featuredImage: imageUrl }
    });
    console.log(`✅ Updated ${post.title}`);
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
