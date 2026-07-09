import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface QuotesWidgetProps {
  stats: {
    savedQuotes: number;
    convertedQuotes: number;
    conversionRate: number;
    averageDiscount: number;
    averageDealSize: number;
  };
}

export function QuotesWidget({ stats }: QuotesWidgetProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3 flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            Calculator Stats
          </CardTitle>
          <CardDescription>Pricing negotiations and saved quotes</CardDescription>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/admin/calculator/saved" />}>
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Saved Quotes</p>
            <p className="text-xl font-bold">{stats.savedQuotes}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Converted</p>
            <p className="text-xl font-bold">{stats.convertedQuotes}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Conversion Rate</p>
            <p className="text-xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Avg Discount</p>
            <p className="text-xl font-bold">₹{stats.averageDiscount.toFixed(0)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Avg Deal Size</p>
            <p className="text-xl font-bold">₹{stats.averageDealSize.toFixed(0)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
