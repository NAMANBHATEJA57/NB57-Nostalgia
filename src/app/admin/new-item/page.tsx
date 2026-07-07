import { AddItemForm } from "@/components/admin/AddItemForm";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function NewItemPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Add New Item</h2>
        <p className="text-muted-foreground mt-1">
          Create a new collectible entry in your archive.
        </p>
      </div>
      
      <AddItemForm categories={categories} />
    </div>
  );
}
