import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata, ResolvingMetadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { getBlogPostBySlug, incrementBlogViews } from "@/lib/data";

export const revalidate = 86400;

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string; category: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  // ✅ Uses React.cache — this query is deduped with the page component
  const post = await getBlogPostBySlug(slug);

  if (!post) return { title: 'Not Found' };

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    keywords: post.focusKeyword ? [post.focusKeyword] : undefined,
    alternates: {
      canonical: post.canonicalUrl || `https://nb57nostalgia.com/blog/${post.category.slug}/${post.slug}`,
    },
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || undefined,
      type: 'article',
      url: `https://nb57nostalgia.com/blog/${post.category.slug}/${post.slug}`,
      images: post.openGraphImage ? [post.openGraphImage] : post.featuredImage ? [post.featuredImage] : [],
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || undefined,
      images: post.twitterImage ? [post.twitterImage] : post.featuredImage ? [post.featuredImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string; category: string }> }) {
  const { slug } = await params;

  // ✅ React.cache dedup — same query as generateMetadata, no duplicate DB call
  const post = await getBlogPostBySlug(slug);

  if (!post || post.status !== 'Published') {
    notFound();
  }

  // ✅ Fire-and-forget — view counter does NOT block page render
  incrementBlogViews(post.id);

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': post.schemaType || 'Article',
    headline: post.title,
    image: post.featuredImage ? [post.featuredImage] : [],
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: [{ '@type': 'Person', name: post.author }],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-slate-900 selection:bg-slate-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="flex-1 w-full pt-24 pb-32">
        {/* Article Header */}
        <header className="max-w-4xl mx-auto px-6 text-center mb-12">
          <div className="mb-6 flex justify-center items-center gap-3 text-sm font-medium">
            <Link href="/blog" className="text-slate-500 hover:text-slate-900 transition-colors">Blog</Link>
            <span className="text-slate-300">/</span>
            <Link href={`/blog/${post.category.slug}`} className="text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider">{post.category.name}</Link>
          </div>
          <h1 className="font-cormorant text-5xl md:text-6xl font-bold mb-6 leading-[1.1]">{post.title}</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
            <div>By <span className="font-medium text-slate-900">{post.author}</span></div>
            <span className="text-slate-300">•</span>
            <div>{post.publishedAt ? formatDate(post.publishedAt) : ''}</div>
            <span className="text-slate-300">•</span>
            <div>{post.readingTime} min read</div>
          </div>
        </header>

        {/* Hero Image */}
        {post.featuredImage && (
          <div className="max-w-5xl mx-auto px-6 mb-16">
            <div className="aspect-[21/9] md:aspect-[2.5/1] relative rounded-3xl overflow-hidden shadow-sm">
              <Image src={post.featuredImage} alt={post.title} fill sizes="(max-width: 1280px) 100vw, 1280px" className="object-cover" priority />
            </div>
          </div>
        )}

        <div className="max-w-[760px] mx-auto px-6">
          {/* Main Content (HTML from Tiptap) */}
          <article 
            className="prose prose-slate prose-lg md:prose-xl max-w-none prose-headings:font-cormorant prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-16 pt-8 border-t border-slate-200">
              <div className="flex flex-wrap gap-2">
                {post.tags.map(t => (
                  <Badge key={t.tagId} variant="secondary" className="bg-white border-slate-200 text-slate-600 font-normal">
                    {t.tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
