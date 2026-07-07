import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Search } from "lucide-react";
import BlogListClient from "./BlogListClient";

export const dynamic = 'force-dynamic';

export default async function BlogHomepage() {
  const featuredPost = await prisma.blogPost.findFirst({
    where: { status: 'Published', featured: true },
    include: { category: true },
    orderBy: { publishedAt: 'desc' }
  });

  const featuredPostId = featuredPost?.id;

  const initialPosts = await prisma.blogPost.findMany({
    where: { status: 'Published', id: featuredPostId ? { not: featuredPostId } : undefined },
    include: { category: true },
    orderBy: { publishedAt: 'desc' },
    take: 9
  });

  const totalCount = await prisma.blogPost.count({
    where: { status: 'Published', id: featuredPostId ? { not: featuredPostId } : undefined }
  });

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-slate-900 selection:bg-slate-200">
      <Navbar />

      <main className="flex-1 w-full pt-24 pb-32">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-6 text-center mb-24 mt-12">
          <h1 className="font-cormorant text-6xl md:text-7xl font-bold mb-6 tracking-tight">
            Knowledge Base
          </h1>
          <p className="text-xl text-slate-500 font-light mb-12 max-w-2xl mx-auto">
            Everything about vintage collectibles. Read guides, history, and identification techniques from India's most trusted digital archive.
          </p>

          <form action="/blog/search" method="GET" className="max-w-xl mx-auto relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" 
              name="q"
              placeholder="Search articles, guides, and history..." 
              className="w-full h-14 pl-12 pr-6 rounded-full border border-slate-200 bg-white shadow-sm text-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            />
          </form>
        </section>

        <div className="max-w-7xl mx-auto px-6 space-y-32">
          
          {/* Featured Article */}
          {featuredPost && (
            <section>
              <Link href={`/blog/${featuredPost.category?.slug || 'general'}/${featuredPost.slug}`} className="group block">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="aspect-[4/3] lg:aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 relative">
                    {featuredPost.featuredImage && (
                      <Image 
                        src={featuredPost.featuredImage} 
                        alt={featuredPost.title} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    )}
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-blue-600 font-medium tracking-wide uppercase">{featuredPost.category?.name || 'General'}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">{featuredPost.readingTime} min read</span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-cormorant font-bold leading-[1.1] group-hover:text-blue-600 transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-lg text-slate-600 font-light leading-relaxed line-clamp-3">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-3 pt-4">
                      <div className="text-sm font-medium text-slate-900">{featuredPost.author}</div>
                      <span className="text-slate-300">•</span>
                      <div className="text-sm text-slate-500">{featuredPost.publishedAt ? formatDate(featuredPost.publishedAt) : ''}</div>
                    </div>
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* All Articles Grid (Lazy Loaded) */}
          <BlogListClient 
            initialPosts={initialPosts} 
            totalCount={totalCount} 
            featuredPostId={featuredPostId} 
          />
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
