import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Search, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

export default async function BlogHomepage() {
  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { posts: { where: { status: 'Published' } } } } }
  });

  const featuredPost = await prisma.blogPost.findFirst({
    where: { status: 'Published', featured: true },
    include: { category: true },
    orderBy: { publishedAt: 'desc' }
  });

  const latestPosts = await prisma.blogPost.findMany({
    where: { status: 'Published', id: featuredPost ? { not: featuredPost.id } : undefined },
    include: { category: true },
    orderBy: { publishedAt: 'desc' },
    take: 6
  });

  const popularPosts = await prisma.blogPost.findMany({
    where: { status: 'Published' },
    include: { category: true },
    orderBy: { views: 'desc' },
    take: 3
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
              <Link href={`/blog/${featuredPost.category.slug}/${featuredPost.slug}`} className="group block">
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
                      <span className="text-blue-600 font-medium tracking-wide uppercase">{featuredPost.category.name}</span>
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

          {/* Latest Articles Grid */}
          {latestPosts.length > 0 && (
            <section>
              <div className="flex items-end justify-between mb-12 border-b border-slate-200 pb-4">
                <h2 className="text-3xl font-cormorant font-bold">Latest Articles</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                {latestPosts.map(post => (
                  <Link href={`/blog/${post.category.slug}/${post.slug}`} key={post.id} className="group block">
                    <div className="aspect-[3/2] rounded-2xl overflow-hidden bg-slate-100 relative mb-6">
                      {post.featuredImage && (
                        <Image 
                          src={post.featuredImage} 
                          alt={post.title} 
                          fill 
                          className="object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                      )}
                    </div>
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                        {post.category.name}
                      </div>
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
              </div>
            </section>
          )}

          {/* Popular Articles & Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 border-t border-slate-200 pt-16">
            
            {/* Popular Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              <h3 className="text-2xl font-cormorant font-bold mb-6">Most Popular</h3>
              <div className="space-y-8">
                {popularPosts.map((post, index) => (
                  <Link href={`/blog/${post.category.slug}/${post.slug}`} key={post.id} className="flex gap-4 group">
                    <div className="text-4xl font-cormorant font-bold text-slate-200 group-hover:text-blue-200 transition-colors">
                      0{index + 1}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-500 mb-1">{post.category.name}</div>
                      <h4 className="font-bold text-lg leading-tight group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-cormorant font-bold mb-8">Browse by Topic</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map(category => (
                  <Link href={`/blog/${category.slug}`} key={category.id} className="bg-white border border-slate-100 rounded-xl p-6 hover:shadow-md hover:border-slate-200 transition-all group text-center">
                    <h4 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors mb-1">{category.name}</h4>
                    <span className="text-xs text-slate-500">{category._count.posts} Articles</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
