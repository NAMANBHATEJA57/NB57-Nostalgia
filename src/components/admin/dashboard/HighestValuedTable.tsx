"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";

interface Item {
  id: string;
  name: string;
  coverImage: string;
  category: { name: string } | null;
  askingPrice: number | null;
  fairValueMax: number | null;
  availability: string;
}

export function HighestValuedTable({ items }: { items: Item[] }) {
  const formatCurrency = (value: number | null) => {
    if (!value) return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="rounded-xl shadow-sm border-border col-span-1 lg:col-span-5">
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Highest Valued Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-[300px]">Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Fair Value</TableHead>
              <TableHead className="text-right">Asking Price</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="border-border/50 hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                      <Image 
                        src={item.coverImage || "/placeholder.jpg"} 
                        alt={item.name} 
                        fill 
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <span className="truncate max-w-[200px]">{item.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{item.category?.name || "-"}</TableCell>
                <TableCell className="text-right text-muted-foreground">{formatCurrency(item.fairValueMax)}</TableCell>
                <TableCell className="text-right font-semibold text-foreground">{formatCurrency(item.askingPrice)}</TableCell>
                <TableCell className="text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    item.availability === "Available" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                    item.availability === "Sold" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                    "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                  }`}>
                    {item.availability}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
