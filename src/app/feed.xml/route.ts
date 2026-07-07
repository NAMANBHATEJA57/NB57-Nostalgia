import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const baseUrl = 'https://nb57nostalgia.com';

  const posts = await prisma.blogPost.findMany({
    where: { status: 'Published' },
    include: { category: true },
    orderBy: { publishedAt: 'desc' },
    take: 20,
  });

  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>NB57's Nostalgia Blog</title>
      <link>${baseUrl}/blog</link>
      <description>Educational archive and collector resources for vintage collectibles.</description>
      <language>en</language>
      ${posts.map((post) => `
        <item>
          <title>${escapeXml(post.title)}</title>
          <link>${baseUrl}/blog/${post.category.slug}/${post.slug}</link>
          <description>${escapeXml(post.excerpt || '')}</description>
          <pubDate>${post.publishedAt ? new Date(post.publishedAt).toUTCString() : ''}</pubDate>
          <category>${escapeXml(post.category.name)}</category>
        </item>
      `).join('')}
    </channel>
  </rss>`;

  return new NextResponse(rssFeed, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate',
    },
  });
}

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
