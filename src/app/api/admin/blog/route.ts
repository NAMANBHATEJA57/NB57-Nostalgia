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

export async function POST(req: Request) {
  const session = await verifySession();
  if (!session) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const json = await req.json();
    const body = blogSchema.parse(json);
    
    // Normalize empty strings for specific URL fields
    const dataToSave = {
      ...body,
      canonicalUrl: body.canonicalUrl === "" ? null : body.canonicalUrl,
      openGraphImage: body.openGraphImage === "" ? null : body.openGraphImage,
      twitterImage: body.twitterImage === "" ? null : body.twitterImage,
      publishedAt: body.status === 'Published' ? new Date() : null,
    };

    const post = await prisma.blogPost.create({
      data: dataToSave
    });

    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
