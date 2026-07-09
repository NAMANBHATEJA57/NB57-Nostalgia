"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NeedsAttentionProps {
  missingImages: number;
  missingPrice: number;
  missingDesc: number;
  missingSEO: number;
  totalItems: number;
}

export function NeedsAttention({ data }: { data: NeedsAttentionProps }) {
  const getPercentage = (count: number) => {
    if (data.totalItems === 0) return 100;
    return Math.round(((data.totalItems - count) / data.totalItems) * 100);
  };

  const items = [
    { label: "Images", count: data.missingImages, progress: getPercentage(data.missingImages) },
    { label: "Prices", count: data.missingPrice, progress: getPercentage(data.missingPrice) },
    { label: "Descriptions", count: data.missingDesc, progress: getPercentage(data.missingDesc) },
    { label: "SEO Meta", count: data.missingSEO, progress: getPercentage(data.missingSEO) },
  ];

  return (
    <Card className="rounded-xl shadow-sm border-border col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Needs Attention
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {items.map((item) => (
          <div key={item.label} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground">{item.label}</span>
              <span className="text-muted-foreground">
                {item.count > 0 ? (
                  <span className="text-destructive font-medium">{item.count} missing</span>
                ) : (
                  <span className="text-green-600 font-medium">Complete</span>
                )}
              </span>
            </div>
            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${item.progress === 100 ? 'bg-green-500' : 'bg-accent'}`} 
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
