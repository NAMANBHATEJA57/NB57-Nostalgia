"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getMorePosts } from "./actions";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlogListClientProps {
  initialPosts: any[];
  totalCount: number;
  featuredPostId?: string;
}

export default function BlogListClient({ initialPosts, totalCount, featuredPostId }: BlogListClientProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(initialPosts.length);
  
  const hasMore = posts.length < totalCount;

  const loadMore = async () => {
    setLoading(true);
    try {
      const morePosts = await getMorePosts(skip, 9, featuredPostId);
      setPosts((prev) => [...prev, ...morePosts]);
      setSkip((prev) => prev + morePosts.length);
    } catch (error) {
      console.error("Failed to load more posts", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (posts.length === 0) return null;

  return (
    <section>
      <div className="flex items-end justify-between mb-12 border-b border-slate-200 pb-4">
        <h2 className="text-3xl font-cormorant font-bold">All Articles</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 mb-16">
        {posts.map(post => (
          <Link href={`/blog/${post.category?.slug || 'general'}/${post.slug}`} key={post.id} className="group block">
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
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                {post.category?.name || 'General'}
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

      {hasMore && (
        <div className="flex justify-center mt-12">
          <Button 
            onClick={loadMore} 
            disabled={loading}
            variant="outline"
            className="rounded-full px-8 py-6 text-base font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Articles"
            )}
          </Button>
        </div>
      )}
    </section>
  );
}
