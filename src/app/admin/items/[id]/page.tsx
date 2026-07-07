import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { EditItemForm } from '@/components/admin/EditItemForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';


export default async function AdminEditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      images: true
    }
  });

  if (!item) {
    notFound();
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/admin/items" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Items
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Edit Item</h2>
        <p className="text-muted-foreground mt-1">
          Make changes to &quot;{item.name}&quot; ({item.sku}).
        </p>
      </div>

      <EditItemForm item={item} />
    </div>
  );
}
