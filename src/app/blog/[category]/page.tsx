import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { notFound } from "next/navigation";
import { getBlogCategoryData } from "@/lib/data";

export const revalidate = 3600;

export default async function BlogCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;

  // ✅ Single cached function — replaces 2 sequential raw Prisma calls
  const data = await getBlogCategoryData(categorySlug);

  if (!data) {
    notFound();
  }

  const { category, posts } = data;

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-slate-900">
      <Navbar />

      <main className="flex-1 w-full pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="mb-16 border-b border-slate-200 pb-12">
            <Link href="/blog" className="text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 inline-block">
              ← Back to Blog
            </Link>
            <h1 className="font-cormorant text-5xl md:text-6xl font-bold mb-4">{category.name}</h1>
            {category.description && (
              <p className="text-xl text-slate-500 font-light max-w-2xl">{category.description}</p>
            )}
            <div className="mt-6 text-sm text-slate-400">{posts.length} Articles</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {posts.map(post => (
              <Link href={`/blog/${post.category.slug}/${post.slug}`} key={post.id} className="group block">
                <div className="aspect-[3/2] rounded-2xl overflow-hidden bg-slate-100 relative mb-6">
                  {post.featuredImage && (
                    <Image 
                      src={post.featuredImage} 
                      alt={post.title} 
                      fill 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  )}
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-cormorant font-bold leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-600 line-clamp-2 font-light text-sm">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-slate-500">{post.publishedAt ? formatDate(post.publishedAt) : ''}</div>
                    <div className="text-xs text-slate-400">{post.readingTime} min read</div>
                  </div>
                </div>
              </Link>
            ))}
            
            {posts.length === 0 && (
              <div className="col-span-full py-24 text-center">
                <div className="text-2xl font-cormorant text-slate-400 mb-2">No articles found</div>
                <p className="text-slate-500">We are currently working on articles for this category. Check back soon.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
