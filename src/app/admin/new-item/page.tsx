import { AddItemForm } from "@/components/admin/AddItemForm";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function NewItemPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">

      
      <AddItemForm categories={categories} />
    </div>
  );
}
