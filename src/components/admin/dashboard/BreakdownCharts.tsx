"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface BreakdownProps {
  collectionData: { name: string; value: number }[];
  conditionData: { condition: string; count: number; percentage: number }[];
}

const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#E0E7FF'];

export function CollectionBreakdown({ data }: { data: BreakdownProps["collectionData"] }) {
  return (
    <Card className="rounded-xl shadow-sm border-border col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Collection Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConditionBreakdown({ data }: { data: BreakdownProps["conditionData"] }) {
  return (
    <Card className="rounded-xl shadow-sm border-border col-span-1 lg:col-span-4 flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Condition Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col justify-center pb-8">
        {data.map((item, i) => (
          <div key={item.condition} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-foreground">{item.condition}</span>
              <span className="text-muted-foreground">{item.percentage}% ({item.count})</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${item.percentage}%`, opacity: 1 - (i * 0.15) }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
