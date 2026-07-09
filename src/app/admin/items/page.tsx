import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ItemsTable } from "@/components/admin/ItemsTable";
import { ExportCsvButton } from "@/components/admin/ExportCsvButton";

export const dynamic = 'force-dynamic'; // Always fetch fresh data for admin

export default async function ItemsPage() {
  const [items, categories] = await Promise.all([
    prisma.item.findMany({
      include: {
        category: { select: { name: true } },
        itemTags: { include: { tag: true } },
        images: true
      },
    orderBy: {
      createdAt: 'desc'
    }
  }),
  prisma.category.findMany({
    select: { name: true },
    orderBy: { name: 'asc' }
  })
  ]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Items ({items.length})</h2>
          <p className="text-muted-foreground mt-1">
            Manage your collectible inventory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportCsvButton items={items} />
          <Link href="/admin/new-item">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </Link>
        </div>
      </div>

      <ItemsTable items={items} allCategories={categories.map(c => c.name)} />
    </div>
  );
}
