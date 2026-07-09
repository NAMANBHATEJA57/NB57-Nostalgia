import { prisma } from "@/lib/prisma";
import { StatCards } from "@/components/admin/dashboard/StatCards";
import { RevenueChart, ProfitChart, ItemsAddedChart, ValueGrowthChart } from "@/components/admin/dashboard/DashboardCharts";
import { CategoryPieChart } from "@/components/admin/dashboard/BreakdownCharts";
import { QuickActions } from "@/components/admin/dashboard/QuickActions";
import { RecentSalesWidget } from "@/components/admin/dashboard/RecentSalesWidget";
import { LatestItemsWidget } from "@/components/admin/dashboard/LatestItemsWidget";
import { LatestInvoicesWidget } from "@/components/admin/dashboard/LatestInvoicesWidget";
import { ReservationsWidget } from "@/components/admin/dashboard/ReservationsWidget";
import { ActivityTimeline } from "@/components/admin/dashboard/ActivityTimeline";
import { MostValuableItems } from "@/components/admin/dashboard/MostValuableItems";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    // Stat card data
    totalItems,
    totalInventoryValue,
    todaysRevenue,
    totalRevenue,
    totalProfit,
    itemsSold,
    itemsReserved,
    totalInvoices,
    pendingPayments,
    draftInvoices,
    recentlyAdded,
    soldThisMonth,
    totalCategories,
    // Chart data
    categoryGroups,
    categories,
    monthlyLedgerEntries,
    // Widget data
    recentSales,
    latestItems,
    latestInvoices,
    expiringReservations,
    activityLogs,
    mostValuable,
  ] = await Promise.all([
    // ─── Stat Cards ─────────────────────────────────────────
    prisma.item.count(),
    prisma.item.aggregate({ _sum: { askingPrice: true } }),
    prisma.ledgerEntry.aggregate({
      where: { type: "Revenue", reversed: false, createdAt: { gte: startOfToday } },
      _sum: { amount: true },
    }),
    prisma.ledgerEntry.aggregate({
      where: { type: "Revenue", reversed: false },
      _sum: { amount: true },
    }),
    prisma.ledgerEntry.aggregate({
      where: { type: "Profit", reversed: false },
      _sum: { amount: true },
    }),
    prisma.item.count({ where: { availability: "Sold" } }),
    prisma.item.count({ where: { availability: "Reserved" } }),
    prisma.invoice.count(),
    prisma.invoice.count({ where: { paymentStatus: "Pending" } }),
    prisma.invoice.count({ where: { paymentStatus: "Draft" } }),
    prisma.item.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    prisma.item.count({ where: { availability: "Sold", soldDate: { gte: startOfMonth } } }),
    prisma.category.count(),

    // ─── Chart Data ─────────────────────────────────────────
    prisma.item.groupBy({ by: ["categoryId"], _count: { id: true }, _sum: { askingPrice: true } }),
    prisma.category.findMany({ select: { id: true, name: true } }),
    prisma.ledgerEntry.findMany({
      where: { 
        createdAt: { gte: new Date(now.getFullYear(), 0, 1) },
        reversed: false,
        type: { in: ["Revenue", "Profit"] }
      },
      select: { createdAt: true, amount: true, type: true },
      orderBy: { createdAt: "asc" },
    }),

    // ─── Widgets ────────────────────────────────────────────
    prisma.invoice.findMany({
      where: { paymentStatus: { in: ["Paid", "Partial"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        invoiceNumber: true,
        grandTotal: true,
        paymentStatus: true,
        createdAt: true,
        customer: { select: { name: true } },
      },
    }),
    prisma.item.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        sku: true,
        coverImage: true,
        askingPrice: true,
        availability: true,
        category: { select: { name: true } },
        createdAt: true,
      },
    }),
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        invoiceNumber: true,
        grandTotal: true,
        paymentStatus: true,
        createdAt: true,
        customer: { select: { name: true } },
      },
    }),
    prisma.reservation.findMany({
      where: { status: "Active", expiryDate: { lte: new Date(Date.now() + 48 * 60 * 60 * 1000) } },
      orderBy: { expiryDate: "asc" },
      take: 5,
      select: {
        id: true,
        customerName: true,
        expiryDate: true,
        status: true,
        deposit: true,
        item: { select: { name: true, sku: true, coverImage: true } },
        customer: { select: { name: true } },
      },
    }),
    prisma.activityLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 10,
      select: { id: true, action: true, entity: true, entityId: true, details: true, admin: true, timestamp: true },
    }),
    prisma.item.findMany({
      where: { askingPrice: { not: null } },
      orderBy: { askingPrice: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        sku: true,
        coverImage: true,
        askingPrice: true,
        availability: true,
        category: { select: { name: true } },
      },
    }),
  ]);

  // ─── Process Data ───────────────────────────────────────────
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const categoryData = categoryGroups
    .map((g: any) => ({
      name: categoryMap.get(g.categoryId) || "Uncategorized",
      count: g._count.id,
      value: g._sum.askingPrice || 0,
    }))
    .sort((a: any, b: any) => b.count - a.count);

  const monthlyData = Array.from({ length: 12 }).map((_, i) => {
    const month = new Date(now.getFullYear(), i, 1);
    const monthName = month.toLocaleDateString("en-US", { month: "short" });
    const monthEntries = monthlyLedgerEntries.filter((entry: any) => {
      const d = new Date(entry.createdAt);
      return d.getMonth() === i;
    });
    
    const revenueEntries = monthEntries.filter((e: any) => e.type === "Revenue");
    const revenue = revenueEntries.reduce((sum: number, e: any) => sum + e.amount, 0);
    const profit = monthEntries.filter((e: any) => e.type === "Profit").reduce((sum: number, e: any) => sum + e.amount, 0);
    const invoices = revenueEntries.length;

    return { month: monthName, revenue, profit, invoices };
  });

  // Stats object
  const stats = {
    totalItems,
    totalInventoryValue: totalInventoryValue._sum.askingPrice || 0,
    todaysRevenue: todaysRevenue._sum.amount || 0,
    totalRevenue: totalRevenue._sum.amount || 0,
    totalProfit: totalProfit._sum.amount || 0,
    itemsSold,
    itemsReserved,
    totalInvoices,
    pendingPayments,
    draftInvoices,
    recentlyAdded,
    soldThisMonth,
    totalCategories,
  };

  // Get time-based greeting
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="flex flex-col min-h-0 h-full">
      {/* Top Bar */}
      <div className="h-14 flex items-center justify-between px-8 border-b border-border bg-card flex-shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Dashboard</h1>
        </div>
        <div className="text-xs text-muted-foreground">
          {now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 bg-background">
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {greeting}, Naman.
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your archive today.
          </p>
        </div>

        <div className="space-y-8">
          {/* Quick Actions */}
          <QuickActions />

          {/* Stat Cards */}
          <StatCards stats={stats} />

          {/* Charts Row 1: Revenue + Profit */}
          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueChart data={monthlyData} />
            <ProfitChart data={monthlyData} />
          </div>

          {/* Charts Row 2: Category Pie + Items Added + Value Growth */}
          <div className="grid gap-6 lg:grid-cols-3">
            <CategoryPieChart data={categoryData} />
            <ItemsAddedChart data={monthlyData} />
            <ValueGrowthChart totalValue={stats.totalInventoryValue} />
          </div>

          {/* Widgets Row 1: Recent Sales + Latest Items */}
          <div className="grid gap-6 lg:grid-cols-2">
            <RecentSalesWidget sales={recentSales} />
            <LatestItemsWidget items={latestItems} />
          </div>

          {/* Widgets Row 2: Invoices + Reservations */}
          <div className="grid gap-6 lg:grid-cols-2">
            <LatestInvoicesWidget invoices={latestInvoices} />
            <ReservationsWidget reservations={expiringReservations} />
          </div>

          {/* Bottom Row: Most Valuable + Activity Timeline */}
          <div className="grid gap-6 lg:grid-cols-2">
            <MostValuableItems items={mostValuable} />
            <ActivityTimeline logs={activityLogs} />
          </div>
        </div>
      </div>
    </div>
  );
}
