"use client";

import { formatCurrency } from "@/lib/constants";
import {
  Package,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  CalendarClock,
  FileText,
  Clock,
  FileEdit,
  PlusCircle,
  BarChart3,
  FolderTree,
  Boxes,
} from "lucide-react";

interface StatsProps {
  stats: {
    totalItems: number;
    totalInventoryValue: number;
    todaysRevenue: number;
    totalRevenue: number;
    totalProfit: number;
    itemsSold: number;
    itemsReserved: number;
    totalInvoices: number;
    pendingPayments: number;
    draftInvoices: number;
    recentlyAdded: number;
    soldThisMonth: number;
    totalCategories: number;
  };
}

const STAT_CARDS = [
  {
    key: "totalItems",
    label: "Inventory",
    icon: Package,
    format: "number",
    gradient: "from-blue-500/10 to-blue-600/5",
    iconColor: "text-blue-600",
  },
  {
    key: "totalInventoryValue",
    label: "Total Inventory Value",
    icon: Boxes,
    format: "currency",
    gradient: "from-indigo-500/10 to-indigo-600/5",
    iconColor: "text-indigo-600",
  },
  {
    key: "todaysRevenue",
    label: "Today's Revenue",
    icon: DollarSign,
    format: "currency",
    gradient: "from-emerald-500/10 to-emerald-600/5",
    iconColor: "text-emerald-600",
  },
  {
    key: "totalRevenue",
    label: "Total Revenue",
    icon: TrendingUp,
    format: "currency",
    gradient: "from-green-500/10 to-green-600/5",
    iconColor: "text-green-600",
  },
  {
    key: "totalProfit",
    label: "Total Profit",
    icon: TrendingUp,
    format: "currency",
    gradient: "from-teal-500/10 to-teal-600/5",
    iconColor: "text-teal-600",
  },
  {
    key: "itemsSold",
    label: "Items Sold",
    icon: ShoppingCart,
    format: "number",
    gradient: "from-orange-500/10 to-orange-600/5",
    iconColor: "text-orange-600",
  },
  {
    key: "itemsReserved",
    label: "Items Reserved",
    icon: CalendarClock,
    format: "number",
    gradient: "from-amber-500/10 to-amber-600/5",
    iconColor: "text-amber-600",
  },
  {
    key: "totalInvoices",
    label: "Invoices",
    icon: FileText,
    format: "number",
    gradient: "from-violet-500/10 to-violet-600/5",
    iconColor: "text-violet-600",
  },
  {
    key: "pendingPayments",
    label: "Pending Payments",
    icon: Clock,
    format: "number",
    gradient: "from-rose-500/10 to-rose-600/5",
    iconColor: "text-rose-600",
  },
  {
    key: "draftInvoices",
    label: "Draft Invoices",
    icon: FileEdit,
    format: "number",
    gradient: "from-slate-500/10 to-slate-600/5",
    iconColor: "text-slate-600",
  },
  {
    key: "recentlyAdded",
    label: "Recently Added",
    icon: PlusCircle,
    format: "number",
    gradient: "from-cyan-500/10 to-cyan-600/5",
    iconColor: "text-cyan-600",
  },
  {
    key: "soldThisMonth",
    label: "Sold This Month",
    icon: BarChart3,
    format: "number",
    gradient: "from-pink-500/10 to-pink-600/5",
    iconColor: "text-pink-600",
  },
  {
    key: "totalCategories",
    label: "Categories",
    icon: FolderTree,
    format: "number",
    gradient: "from-purple-500/10 to-purple-600/5",
    iconColor: "text-purple-600",
  },
] as const;

export function StatCards({ stats }: StatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {STAT_CARDS.map((card) => {
        const value = stats[card.key as keyof typeof stats];
        const Icon = card.icon;

        return (
          <div
            key={card.key}
            className={`relative overflow-hidden rounded-xl border border-border bg-gradient-to-br ${card.gradient} p-5`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {card.label}
                </p>
                <p className="text-2xl font-semibold tracking-tight text-foreground">
                  {card.format === "currency" ? formatCurrency(value) : value.toLocaleString("en-IN")}
                </p>
              </div>
              <div className={`rounded-lg bg-background/80 p-2 ${card.iconColor}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
