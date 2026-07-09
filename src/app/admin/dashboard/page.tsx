import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/admin/dashboard/TopBar";
import { StatCards } from "@/components/admin/dashboard/StatCards";
import { InventoryBarChart, ValueAreaChart } from "@/components/admin/dashboard/DashboardCharts";
import { CollectionBreakdown, ConditionBreakdown } from "@/components/admin/dashboard/BreakdownCharts";
import { HighestValuedTable } from "@/components/admin/dashboard/HighestValuedTable";
import { NeedsAttention } from "@/components/admin/dashboard/NeedsAttention";

import { ProgressionTracker } from "@/components/admin/dashboard/ProgressionTracker";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [
    totalItems,
    availableItems,
    sealedItems,
    valueAggregation,
    highestValued,
    categoryGroups,
    conditionGroups,
    categories,
    missingImages,
    missingPrice,
    missingDesc,
    missingSEO
  ] = await Promise.all([
    prisma.item.count(),
    prisma.item.count({ where: { availability: "Available" } }),
    prisma.item.count({ where: { sealed: true } }),
    prisma.item.aggregate({ _sum: { askingPrice: true } }),
    prisma.item.findMany({
      where: { askingPrice: { not: null } },
      orderBy: { askingPrice: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        coverImage: true,
        category: { select: { name: true } },
        askingPrice: true,
        fairValueMax: true,
        availability: true
      }
    }),
    prisma.item.groupBy({
      by: ['categoryId'],
      _count: { id: true }
    }),
    prisma.item.groupBy({
      by: ['condition'],
      _count: { id: true }
    }),
    prisma.category.findMany({ select: { id: true, name: true } }),
    prisma.item.count({ where: { OR: [{ coverImage: '' }] } }),
    prisma.item.count({ where: { askingPrice: null } }),
    prisma.item.count({ where: { OR: [{ description: '' }] } }),
    prisma.item.count({ where: { OR: [{ metaTitle: null }, { metaDescription: null }] } })
  ]);
  
  const estimatedValue = valueAggregation._sum.askingPrice || 0;

  // Process category data
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  const categoryData = categoryGroups.map(g => ({
    name: categoryMap.get(g.categoryId) || 'Uncategorized',
    total: g._count.id
  })).sort((a, b) => b.total - a.total);

  const collectionData = categoryData.map(d => ({ name: d.name, value: d.total }));

  // Extract progression data by mapping category names (case-insensitive check)
  const progressionData = {
    pokemon: 0,
    yugioh: 0,
    ben10: 0,
    bakugan: 0,
    beyblade: 0
  };

  categoryData.forEach(d => {
    const lowerName = d.name.toLowerCase();
    if (lowerName.includes('pokemon')) progressionData.pokemon += d.total;
    if (lowerName.includes('yu-gi-oh') || lowerName.includes('yugioh')) progressionData.yugioh += d.total;
    if (lowerName.includes('ben 10') || lowerName.includes('ben10')) progressionData.ben10 += d.total;
    if (lowerName.includes('bakugan')) progressionData.bakugan += d.total;
    if (lowerName.includes('beyblade') || lowerName.includes('spinner')) progressionData.beyblade += d.total;
  });

  // Process condition data
  const conditionData = conditionGroups.map(g => ({
    condition: g.condition || 'Unknown',
    count: g._count.id,
    percentage: totalItems > 0 ? Math.round((g._count.id / totalItems) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  // Mock 30-day value trend
  const valueData = Array.from({ length: 14 }).map((_, i) => ({
    date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: Math.round(estimatedValue * (0.95 + (i * 0.003) + Math.random() * 0.01))
  }));

  const attentionData = {
    missingImages,
    missingPrice,
    missingDesc,
    missingSEO,
    totalItems
  };

  return (
    <div className="flex flex-col min-h-0 h-full">
      <TopBar />
      <div className="flex-1 overflow-auto p-8 bg-background">
        <div className="mb-8">
          <h2 className="text-2xl font-sans font-semibold tracking-tight text-foreground">Good Evening, Naman.</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Archive Overview • Last sync: Just now
          </p>
        </div>

        <div className="space-y-6">
          <StatCards 
            totalItems={totalItems} 
            totalValue={estimatedValue} 
            sealedItems={sealedItems} 
            availableItems={availableItems} 
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <InventoryBarChart data={categoryData} />
            <ValueAreaChart data={valueData} />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <ConditionBreakdown data={conditionData} />
            <CollectionBreakdown data={collectionData} />
          </div>

          <div className="grid gap-6 lg:grid-cols-8">
            <HighestValuedTable items={highestValued} />
            <ProgressionTracker data={progressionData} />
          </div>

          <div className="grid gap-6 lg:grid-cols-8">
            <div className="col-span-1 lg:col-span-5"></div>
            <NeedsAttention data={attentionData} />
          </div>
        </div>
      </div>
    </div>
  );
}
