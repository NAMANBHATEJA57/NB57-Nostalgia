"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface CategoryData {
  name: string;
  count: number;
  value: number;
}

const COLORS = [
  "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE",
  "#818CF8", "#A78BFA", "#C4B5FD", "#6366F1", "#4F46E5",
];

export function CategoryPieChart({ data }: { data: CategoryData[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Categories</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Distribution across categories</p>
      </div>
      <div className="flex items-center gap-6">
        <div className="h-48 w-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={2}
                dataKey="count"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload as CategoryData;
                  return (
                    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
                      <p className="text-xs font-medium text-foreground">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.count} items</p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-1.5 max-h-48 overflow-y-auto">
          {data.slice(0, 8).map((d, i) => (
            <div key={d.name} className="flex items-center gap-2 text-xs">
              <div
                className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-muted-foreground truncate flex-1">{d.name}</span>
              <span className="font-medium text-foreground tabular-nums">{d.count}</span>
              <span className="text-muted-foreground w-8 text-right">
                {total > 0 ? Math.round((d.count / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
