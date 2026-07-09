'use server';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { unstable_cache } from 'next/cache';
import { sortAlphabetically, sortConditions } from '@/lib/sort';

const ITEMS_PER_PAGE = 24;
const REVALIDATE_TIME = 3600;

export async function getCollectionItems(
  page = 1,
  filters: { search?: string; category?: string[]; status?: string[]; condition?: string[]; sealed?: boolean } = {}
) {
  const where: Prisma.ItemWhereInput = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } }
    ];
  }

  if (filters.sealed) {
    where.sealed = true;
  }

  if (filters.category && filters.category.length > 0) {
    where.category = { name: { in: filters.category, mode: 'insensitive' } };
  }

  if (filters.status && filters.status.length > 0) {
    where.availability = { in: filters.status };
  }

  if (filters.condition && filters.condition.length > 0) {
    where.condition = { in: filters.condition };
  }

  const items = await prisma.item.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * ITEMS_PER_PAGE,
    take: ITEMS_PER_PAGE + 1,
    select: {
      id: true,
      slug: true,
      name: true,
      coverImage: true,
      availability: true,
      condition: true,
      askingPrice: true,
      sealed: true,
      featured: true,
      category: {
        select: {
          name: true,
        }
      }
    }
  });

  const hasMore = items.length > ITEMS_PER_PAGE;
  const data = items.slice(0, ITEMS_PER_PAGE);

  return { items: data, hasMore };
}

export const getCollectionFilters = unstable_cache(
  async () => {
    // ✅ Parallel fetch for categories and conditions
    const [categories, distinctItems] = await Promise.all([
      prisma.category.findMany({ select: { name: true } }),
      prisma.item.findMany({
        select: { condition: true },
        distinct: ['condition']
      })
    ]);

    const statuses = ['Available', 'Reserved', 'Sold', 'Not for Sale']; // Availability uses custom static order
    const conditions = distinctItems.map(i => i.condition).filter(Boolean);

    return { 
      categories: sortAlphabetically(categories.map(c => c.name)), 
      statuses, 
      conditions: sortConditions(conditions) 
    };
  },
  ['collection-filters'],
  { revalidate: REVALIDATE_TIME, tags: ['items', 'categories'] }
);

export const getCollectionTotalCount = unstable_cache(
  async () => {
    return prisma.item.count();
  },
  ['collection-total-count'],
  { revalidate: REVALIDATE_TIME, tags: ['items'] }
);
