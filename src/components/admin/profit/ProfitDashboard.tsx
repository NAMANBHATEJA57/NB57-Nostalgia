"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface LedgerEntry {
  type: string;
  amount: number;
  createdAt: Date;
  reversed: boolean;
}

interface ProfitDashboardProps {
  entries: LedgerEntry[];
}

export function ProfitDashboard({ entries }: ProfitDashboardProps) {
  const validEntries = entries.filter((e) => !e.reversed);

  const stats = useMemo(() => {
    let revenue = 0, cost = 0, shipping = 0, packaging = 0, misc = 0;
    validEntries.forEach((e) => {
      if (e.type === "Revenue") revenue += e.amount;
      if (e.type === "InventoryCost") cost += Math.abs(e.amount); // stored as negative in ledger
      if (e.type === "Shipping") shipping += Math.abs(e.amount);
      if (e.type === "Packaging") packaging += Math.abs(e.amount);
      if (e.type === "Misc") misc += Math.abs(e.amount);
    });

    const grossProfit = revenue - cost;
    const netProfit = grossProfit - shipping - packaging - misc;
    const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    return { revenue, cost, shipping, packaging, misc, grossProfit, netProfit, margin };
  }, [validEntries]);

  // Group by month for chart
  const monthlyData = useMemo(() => {
    const dataMap = new Map<string, { month: string, revenue: number, profit: number }>();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      dataMap.set(m, { month: m, revenue: 0, profit: 0 });
    }

    validEntries.forEach(e => {
      const m = new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (dataMap.has(m)) {
        const item = dataMap.get(m)!;
        if (e.type === "Revenue") item.revenue += e.amount;
        if (e.type === "Profit") item.profit += e.amount;
      }
    });

    return Array.from(dataMap.values());
  }, [validEntries]);

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">COGS (Cost of Goods)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-{formatCurrency(stats.cost)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {formatCurrency(stats.netProfit)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.margin >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {stats.margin.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground">Inventory Cost</span>
                <span className="font-semibold text-red-600">-{formatCurrency(stats.cost)}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-semibold text-red-600">-{formatCurrency(stats.shipping)}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground">Packaging</span>
                <span className="font-semibold text-red-600">-{formatCurrency(stats.packaging)}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground">Misc Charges</span>
                <span className="font-semibold text-red-600">-{formatCurrency(stats.misc)}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 font-bold">
                <span>Total Expenses</span>
                <span className="text-red-600">-{formatCurrency(stats.cost + stats.shipping + stats.packaging + stats.misc)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Profit (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#000000" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
