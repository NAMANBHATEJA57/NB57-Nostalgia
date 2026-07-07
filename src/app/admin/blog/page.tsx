import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Eye, Edit, Trash, Copy, CheckCircle2, XCircle } from "lucide-react";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function AdminBlogDashboard() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true }
  });

  const totalArticles = posts.length;
  const publishedCount = posts.filter(p => p.status === 'Published').length;
  const draftsCount = posts.filter(p => p.status === 'Draft').length;
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-cormorant font-bold mb-2">Blog Management</h1>
          <p className="text-slate-500">Manage your SEO articles, guides, and knowledge base.</p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="bg-slate-900 hover:bg-blue-600 text-white rounded-full px-6">
            <Plus className="w-4 h-4 mr-2" />
            Write Article
          </Button>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-slate-500 text-sm font-medium mb-2">Total Articles</div>
          <div className="text-3xl font-bold font-mono text-slate-900">{totalArticles}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-slate-500 text-sm font-medium mb-2">Published</div>
          <div className="text-3xl font-bold font-mono text-emerald-600">{publishedCount}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-slate-500 text-sm font-medium mb-2">Drafts</div>
          <div className="text-3xl font-bold font-mono text-amber-600">{draftsCount}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-slate-500 text-sm font-medium mb-2">Total Views</div>
          <div className="text-3xl font-bold font-mono text-blue-600">{totalViews}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm font-medium uppercase tracking-wider">
                <th className="p-4 font-semibold">Article</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Views</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4 flex items-center gap-4">
                    <div className="w-16 h-12 relative rounded bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      {post.featuredImage ? (
                        <Image src={post.featuredImage} alt={post.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 line-clamp-1">{post.title}</div>
                      <div className="text-xs text-slate-500 mt-1">/{post.slug}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="bg-slate-50">
                      {post.category?.name || 'Uncategorized'}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {post.status === 'Published' ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Published</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Draft</Badge>
                    )}
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-mono text-sm">
                    {post.views}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {post.status === 'Published' && (
                        <Link href={`/blog/${post.category?.slug}/${post.slug}`} target="_blank">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      <Link href={`/admin/blog/${post.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <FileText className="w-12 h-12 text-slate-200" />
                      <p>No articles found. Start writing your first piece!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
