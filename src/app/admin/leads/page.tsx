import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ArrowRightLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { deleteLead } from "./actions";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Leads / Inquiries</h2>
      </div>
      
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Est. Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground h-32">
                  No inquiries found.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium font-mono text-xs">{lead.leadNumber}</TableCell>
                  <TableCell>
                    <div className="font-medium">{lead.buyerName}</div>
                    <div className="text-xs text-muted-foreground">{lead.city}{lead.state ? `, ${lead.state}` : ''}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{lead.phone}</div>
                    <div className="text-xs text-muted-foreground">{lead.email || '—'}</div>
                  </TableCell>
                  <TableCell>{lead.items.length} items</TableCell>
                  <TableCell className="text-right">₹{lead.estimatedValue.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      lead.status === "New" ? "default" :
                      lead.status === "Converted" ? "secondary" : 
                      lead.status === "Lost" ? "destructive" : "outline"
                    }>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(lead.createdAt), "dd MMM yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <form action={async () => {
                        "use server";
                        await deleteLead(lead.id);
                      }}>
                        <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                      {lead.status !== "Converted" && (
                        <Button variant="outline" size="sm" className="h-8 text-xs ml-2">
                          <ArrowRightLeft className="h-3 w-3 mr-1" /> Invoice
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
