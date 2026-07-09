import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();

  for (const cat of categories) {
    let url = '';
    const lower = cat.name.toLowerCase();
    
    if (lower.includes('pokemon')) {
      url = 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=800';
    } else if (lower.includes('yu-gi-oh')) {
      url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjwAcOcJ7LT2lQqGYZjnTXzjZK4rwlcvQW3IO8JpZWPhm8Z3_LPVQ2CO5b&s=10';
    } else if (lower.includes('ben 10')) {
      url = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyR6SW8d1bUW7wbpuQ8ozxb_G-91JlqfAfG7jXWs0K3Qty9Yf78gyyKCMz&s=10';
    } else if (lower.includes('bakugan')) {
      url = 'https://images.unsplash.com/photo-1618218168350-6e7c81151b64?q=80&w=800';
    } else if (lower.includes('beyblade')) {
      url = 'https://m.media-amazon.com/images/M/MV5BZDY4YzZkYzEtNTAzNS00NTE0LWIxMDktNmM4MTFmNDQ0NmIzXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg';
    } else if (lower.includes('others')) {
      url = 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?q=80&w=800';
    }

    if (url && !cat.thumbnailImage) {
      await prisma.category.update({
        where: { id: cat.id },
        data: { thumbnailImage: url }
      });
      console.log(`Updated ${cat.name} thumbnail.`);
    } else if (url && cat.thumbnailImage !== url && cat.name.toLowerCase().includes('beyblade')) {
        // Specifically update beyblade just in case
        await prisma.category.update({
            where: { id: cat.id },
            data: { thumbnailImage: url }
        });
        console.log(`Updated ${cat.name} thumbnail.`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
