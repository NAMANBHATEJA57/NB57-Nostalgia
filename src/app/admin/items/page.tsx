import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ItemsTable } from "@/components/admin/ItemsTable";

export const dynamic = 'force-dynamic'; // Always fetch fresh data for admin

export default async function ItemsPage() {
  const [items, categories] = await Promise.all([
    prisma.item.findMany({
      select: {
      id: true,
      sku: true,
      slug: true,
      name: true,
      coverImage: true,
      availability: true,
      condition: true,
      askingPrice: true,
      sealed: true,
      featured: true,
      series: true,
      fairValueMax: true,
      createdAt: true,
      category: { select: { name: true } }
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
          <h2 className="text-3xl font-bold tracking-tight">Items</h2>
          <p className="text-muted-foreground mt-1">
            Manage your collectible inventory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
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
