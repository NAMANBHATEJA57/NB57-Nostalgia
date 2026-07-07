"use server";

import { prisma } from "@/lib/prisma";

export async function getMorePosts(skip: number, take: number = 9, excludeId?: string) {
  const posts = await prisma.blogPost.findMany({
    where: { 
      status: 'Published',
      id: excludeId ? { not: excludeId } : undefined
    },
    include: { category: true },
    orderBy: { publishedAt: 'desc' },
    skip,
    take
  });

  return posts;
}
