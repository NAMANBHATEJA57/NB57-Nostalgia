import { prisma } from "@/lib/prisma";
import { BlogEditorForm } from "@/components/admin/BlogEditorForm";
import { notFound } from "next/navigation";


export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // ✅ Parallel fetch
  const [post, categories] = await Promise.all([
    prisma.blogPost.findUnique({ where: { id } }),
    prisma.blogCategory.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    })
  ]);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <BlogEditorForm initialData={post} categories={categories} />
    </div>
  );
}
