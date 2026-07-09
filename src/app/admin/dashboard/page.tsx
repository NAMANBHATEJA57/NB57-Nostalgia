import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CheckCircle, Tag, DollarSign } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // ✅ Parallel fetch — all 5 queries run simultaneously
  const [totalItems, availableItems, totalCategories, valueAggregation, recentlyAdded] = await Promise.all([
    prisma.item.count(),
    prisma.item.count({ where: { availability: "Available" } }),
    prisma.category.count(),
    prisma.item.aggregate({ _sum: { askingPrice: true } }),
    prisma.item.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        coverImage: true,
        askingPrice: true,
        category: { select: { name: true } }
      }
    })
  ]);
  
  const estimatedValue = valueAggregation._sum.askingPrice || 0;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-heading font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Overview of your collection and recent activity.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-primary">{totalItems}</div>
            <p className="text-xs text-muted-foreground">In your collection</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-primary">{availableItems}</div>
            <p className="text-xs text-muted-foreground">Ready for sale/trade</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-primary">{totalCategories}</div>
            <p className="text-xs text-muted-foreground">Active categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Est. Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-primary">₹{estimatedValue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">Based on asking price</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground text-center py-10">
              No recent activity found.
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recently Added</CardTitle>
          </CardHeader>
          <CardContent>
            {recentlyAdded.length > 0 ? (
              <div className="space-y-4">
                {recentlyAdded.map(item => (
                  <div key={item.id} className="flex items-center gap-4 border-b border-border/50 pb-4 last:border-0 last:pb-0 hover:bg-accent/5 p-2 rounded-lg transition-colors">
                    <div className="h-10 w-10 rounded overflow-hidden bg-slate-100 flex-shrink-0 relative">
                      <Image src={item.coverImage} alt={item.name} fill sizes="40px" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.category?.name || 'Uncategorized'}</p>
                    </div>
                    <div className="text-sm font-mono font-bold text-primary whitespace-nowrap">
                      {item.askingPrice ? `₹${item.askingPrice}` : '-'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-10">
                No items added yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
