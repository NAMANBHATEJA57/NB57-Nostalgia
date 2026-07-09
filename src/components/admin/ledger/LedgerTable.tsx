"use client";

import { useState, useMemo } from "react";
import { formatCurrency } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Search, Filter } from "lucide-react";

interface LedgerEntry {
  id: string;
  type: string;
  amount: number;
  description: string;
  reversed: boolean;
  createdAt: Date;
  invoiceId: string | null;
  invoice?: { invoiceNumber: string } | null;
}

interface LedgerTableProps {
  entries: LedgerEntry[];
}

export function LedgerTable({ entries }: LedgerTableProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("All");

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        entry.description.toLowerCase().includes(search.toLowerCase()) ||
        entry.type.toLowerCase().includes(search.toLowerCase()) ||
        (entry.invoice?.invoiceNumber && entry.invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()));

      const matchesType = filterType === "All" || entry.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [entries, search, filterType]);

  const handleExportCSV = () => {
    const headers = ["Date", "Type", "Invoice Number", "Description", "Amount", "Reversed"];
    const csvContent = [
      headers.join(","),
      ...filteredEntries.map(e => [
        new Date(e.createdAt).toLocaleDateString("en-IN"),
        e.type,
        e.invoice?.invoiceNumber || "-",
        `"${e.description.replace(/"/g, '""')}"`,
        e.amount,
        e.reversed ? "Yes" : "No"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uniqueTypes = ["All", ...Array.from(new Set(entries.map(e => e.type))).sort()];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search description, invoice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-9 pr-8 h-9 text-sm rounded-md border border-input bg-background"
            >
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        <Button onClick={handleExportCSV} variant="outline" size="sm" className="flex-shrink-0">
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Invoice</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Description</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No entries found
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className={`hover:bg-muted/20 transition-colors ${entry.reversed ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleDateString("en-IN")}
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium ring-1 ring-inset ring-border">
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {entry.invoice?.invoiceNumber ? (
                        <a href={`/admin/invoices/${entry.invoiceId}`} className="text-blue-600 hover:underline">
                          {entry.invoice.invoiceNumber}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {entry.description}
                      {entry.reversed && <span className="ml-2 text-xs text-red-500 font-medium">(Reversed)</span>}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium tabular-nums ${entry.amount > 0 ? "text-emerald-600" : entry.amount < 0 ? "text-red-600" : ""}`}>
                      {entry.amount > 0 ? "+" : ""}{formatCurrency(entry.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
