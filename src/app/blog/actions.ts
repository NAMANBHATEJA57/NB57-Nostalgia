"use server";

import { prisma } from "@/lib/prisma";

export async function getMorePosts(skip: number, take: number = 9, excludeId?: string) {
  const posts = await prisma.blogPost.findMany({
    where: { 
      status: 'Published',
      id: excludeId ? { not: excludeId } : undefined
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      author: true,
      readingTime: true,
      publishedAt: true,
      category: { select: { name: true, slug: true } }
    },
    orderBy: { publishedAt: 'desc' },
    skip,
    take
  });

  return posts;
}
