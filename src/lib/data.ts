import { prisma } from './prisma';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

const REVALIDATE_TIME = 3600;

// ─── Homepage ───────────────────────────────────────────────

export const getHomepageItems = unstable_cache(
  async () => {
    return prisma.item.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
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
  },
  ['homepage-items'],
  { revalidate: REVALIDATE_TIME, tags: ['items'] }
);

export const getCategoriesWithCounts = unstable_cache(
  async () => {
    return prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        thumbnailImage: true,
        _count: {
          select: { items: true }
        }
      }
    });
  },
  ['categories-with-counts'],
  { revalidate: REVALIDATE_TIME, tags: ['categories'] }
);

export const getStatistics = unstable_cache(
  async () => {
    const [totalItems, sealedItems, soldItems] = await Promise.all([
      prisma.item.count(),
      prisma.item.count({ where: { sealed: true } }),
      prisma.item.count({ where: { availability: 'Sold' } })
    ]);

    return { totalItems, sealedItems, soldItems };
  },
  ['global-statistics'],
  { revalidate: REVALIDATE_TIME, tags: ['items'] }
);

// ─── Blog Homepage ──────────────────────────────────────────

export const getBlogHomepageData = unstable_cache(
  async () => {
    const featuredPost = await prisma.blogPost.findFirst({
      where: { status: 'Published', featured: true },
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
      orderBy: { publishedAt: 'desc' }
    });

    const featuredPostId = featuredPost?.id;

    const [initialPosts, totalCount] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: 'Published', id: featuredPostId ? { not: featuredPostId } : undefined },
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
        take: 9
      }),
      prisma.blogPost.count({
        where: { status: 'Published', id: featuredPostId ? { not: featuredPostId } : undefined }
      })
    ]);

    return { featuredPost, initialPosts, totalCount };
  },
  ['blog-homepage'],
  { revalidate: REVALIDATE_TIME, tags: ['blog'] }
);

// ─── Blog Post (React.cache for metadata + page dedup) ─────

export const getBlogPostBySlug = cache(async (slug: string) => {
  return prisma.blogPost.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      featuredImage: true,
      author: true,
      status: true,
      readingTime: true,
      seoTitle: true,
      seoDescription: true,
      focusKeyword: true,
      schemaType: true,
      canonicalUrl: true,
      openGraphImage: true,
      twitterImage: true,
      publishedAt: true,
      updatedAt: true,
      views: true,
      category: { select: { name: true, slug: true } },
      tags: { select: { tag: { select: { name: true } }, tagId: true } }
    }
  });
});

// Fire-and-forget view increment (non-blocking)
export async function incrementBlogViews(postId: string) {
  try {
    await prisma.blogPost.update({
      where: { id: postId },
      data: { views: { increment: 1 } }
    });
  } catch {
    // Silently fail — view count is not critical
  }
}

// ─── Blog Category Page ─────────────────────────────────────

export const getBlogCategoryData = unstable_cache(
  async (categorySlug: string) => {
    const category = await prisma.blogCategory.findUnique({
      where: { slug: categorySlug },
      select: { id: true, name: true, slug: true, description: true }
    });

    if (!category) return null;

    const posts = await prisma.blogPost.findMany({
      where: { categoryId: category.id, status: 'Published' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        readingTime: true,
        publishedAt: true,
        category: { select: { slug: true } }
      },
      orderBy: { publishedAt: 'desc' }
    });

    return { category, posts };
  },
  ['blog-category'],
  { revalidate: REVALIDATE_TIME, tags: ['blog'] }
);

// ─── Item Detail (React.cache for metadata + page dedup) ───

export const getItemBySlug = cache(async (slug: string) => {
  return prisma.item.findUnique({
    where: { slug },
    select: {
      id: true,
      sku: true,
      slug: true,
      name: true,
      description: true,
      specifications: true,
      coverImage: true,
      availability: true,
      condition: true,
      askingPrice: true,
      fairValueMin: true,
      fairValueMax: true,
      highestSeenPrice: true,
      priceConfidence: true,
      priceSource: true,
      sealed: true,
      featured: true,
      manufacturer: true,
      releaseYear: true,
      series: true,
      character: true,
      categoryId: true,
      category: { select: { name: true } },
      images: {
        select: { id: true, url: true },
        orderBy: { order: 'asc' }
      },
      itemTags: {
        select: {
          tagId: true,
          tag: { select: { name: true } }
        }
      }
    }
  });
});

export const getRelatedItems = unstable_cache(
  async (categoryId: string, excludeId: string) => {
    return prisma.item.findMany({
      where: { categoryId, id: { not: excludeId } },
      take: 4,
      select: {
        id: true,
        slug: true,
        name: true,
        coverImage: true,
        askingPrice: true,
      }
    });
  },
  ['related-items'],
  { revalidate: REVALIDATE_TIME, tags: ['items'] }
);

// ─── Sitemap ────────────────────────────────────────────────

export const getSitemapData = unstable_cache(
  async () => {
    const [posts, items] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: 'Published' },
        select: {
          slug: true,
          updatedAt: true,
          category: { select: { slug: true } }
        }
      }),
      prisma.item.findMany({
        where: { hideFromPublic: false },
        select: {
          slug: true,
          updatedAt: true,
        }
      })
    ]);

    return { posts, items };
  },
  ['sitemap-data'],
  { revalidate: REVALIDATE_TIME, tags: ['items', 'blog'] }
);
