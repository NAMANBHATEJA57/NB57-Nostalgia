"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import Link from "next/link";

interface LeadsWidgetProps {
  totalLeads: number;
  convertedLeads: number;
  averageValue: number;
}

export function LeadsWidget({ totalLeads, convertedLeads, averageValue }: LeadsWidgetProps) {
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  return (
    <Card className="col-span-1 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center text-lg font-medium">
            <MessageCircle className="w-5 h-5 mr-2 text-emerald-500" />
            WhatsApp Inquiries
          </CardTitle>
          <CardDescription>Collector leads from the storefront</CardDescription>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/admin/leads" />}>
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
            <p className="text-2xl font-bold">{totalLeads}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Average Value</p>
            <p className="text-2xl font-bold">₹{averageValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Converted</p>
            <p className="text-2xl font-bold">{convertedLeads}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold">{conversionRate}%</p>
              {conversionRate > 20 && <ArrowUpRight className="w-4 h-4 text-emerald-500 ml-1" />}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
