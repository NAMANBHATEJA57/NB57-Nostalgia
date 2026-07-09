"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrackerProps {
  data: {
    pokemon: number;
    yugioh: number;
    ben10: number;
    bakugan: number;
    beyblade: number;
  };
}

const SET_SIZES = {
  Pokemon: 151,
  "Yu-Gi-Oh!": 240,
  "Ben 10": 120,
  Bakugan: 96,
  Beyblade: 160,
};

export function ProgressionTracker({ data }: TrackerProps) {
  const items = [
    { label: "Pokemon", count: data.pokemon || 0, total: SET_SIZES.Pokemon },
    { label: "Yu-Gi-Oh!", count: data.yugioh || 0, total: SET_SIZES["Yu-Gi-Oh!"] },
    { label: "Ben 10", count: data.ben10 || 0, total: SET_SIZES["Ben 10"] },
    { label: "Bakugan", count: data.bakugan || 0, total: SET_SIZES.Bakugan },
    { label: "Beyblade", count: data.beyblade || 0, total: SET_SIZES.Beyblade },
  ];

  return (
    <Card className="rounded-xl shadow-sm border-border col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Collection Progression
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {items.map((item) => {
          const progress = Math.min(Math.round((item.count / item.total) * 100), 100);
          return (
            <div key={item.label} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">{item.label}</span>
                <span className="text-muted-foreground">
                  {item.count} / {item.total}
                </span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
