import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ItemsTable } from "@/components/admin/ItemsTable";

export const dynamic = 'force-dynamic'; // Always fetch fresh data for admin

export default async function ItemsPage() {
  const items = await prisma.item.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

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

      <ItemsTable items={items} />
    </div>
  );
}
