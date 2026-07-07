import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nb57nostalgia.com';

  const posts = await prisma.blogPost.findMany({
    where: { status: 'Published' },
    include: { category: true },
  });

  const blogUrls = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.category.slug}/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const items = await prisma.item.findMany({
    where: { hideFromPublic: false }
  });

  const itemUrls = items.map((item) => ({
    url: `${baseUrl}/collection/${item.slug}`,
    lastModified: item.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collection`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  return [...staticUrls, ...blogUrls, ...itemUrls];
}
