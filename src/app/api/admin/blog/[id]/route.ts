import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as z from 'zod';
import { verifySession } from '@/lib/session';

const blogSchema = z.object({
  title: z.string(),
  slug: z.string(),
  categoryId: z.string(),
  excerpt: z.string().optional(),
  content: z.string(),
  featuredImage: z.string().optional(),
  author: z.string().default("NB57's Nostalgia"),
  status: z.string().default("Draft"),
  featured: z.boolean().default(false),
  pinned: z.boolean().default(false),
  readingTime: z.number().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  focusKeyword: z.string().optional(),
  canonicalUrl: z.string().optional().or(z.literal("")),
  schemaType: z.string().default("Article"),
  estimatedDifficulty: z.string().optional(),
  openGraphImage: z.string().optional().or(z.literal("")),
  twitterImage: z.string().optional().or(z.literal("")),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id } = await params;
    const json = await req.json();
    const body = blogSchema.parse(json);
    
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const dataToUpdate = {
      ...body,
      canonicalUrl: body.canonicalUrl === "" ? null : body.canonicalUrl,
      openGraphImage: body.openGraphImage === "" ? null : body.openGraphImage,
      twitterImage: body.twitterImage === "" ? null : body.twitterImage,
      // Publish date logic
      publishedAt: body.status === 'Published' && existing.status !== 'Published' ? new Date() : existing.publishedAt,
    };

    const post = await prisma.blogPost.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
