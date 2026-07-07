import { prisma } from "@/lib/prisma";
import { BlogEditorForm } from "@/components/admin/BlogEditorForm";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const post = await prisma.blogPost.findUnique({
    where: { id }
  });

  if (!post) {
    notFound();
  }

  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  });

  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <BlogEditorForm initialData={post} categories={categories} />
    </div>
  );
}
