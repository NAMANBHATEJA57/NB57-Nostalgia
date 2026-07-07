import { prisma } from "@/lib/prisma";
import { BlogEditorForm } from "@/components/admin/BlogEditorForm";

export const dynamic = 'force-dynamic';

export default async function NewBlogPostPage() {
  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  });

  return (
    <div className="min-h-screen bg-slate-50/50 py-8">
      <BlogEditorForm categories={categories} />
    </div>
  );
}
