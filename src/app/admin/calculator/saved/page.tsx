import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Copy, Trash2, ArrowRightLeft } from "lucide-react";
import Link from "next/link";
import { deleteQuote } from "../actions";

export default async function SavedQuotesPage() {
  const quotes = await prisma.quote.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { items: true },
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Saved Calculations</h2>
        <Button render={<Link href="/admin/calculator" />}>
          New Calculation
        </Button>
      </div>
      
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground h-32">
                  No saved calculations found.
                </TableCell>
              </TableRow>
            ) : (
              quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.title || "Untitled"}</TableCell>
                  <TableCell>{quote.customerName || "Walk-in Customer"}</TableCell>
                  <TableCell>{quote.items.length} items</TableCell>
                  <TableCell className="text-right">₹{quote.grandTotal.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={quote.status === "Converted" ? "default" : "secondary"}>
                      {quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(quote.createdAt), "dd MMM yyyy")}</TableCell>
                  <TableCell>{format(new Date(quote.updatedAt), "dd MMM yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" render={<Link href={`/admin/calculator?id=${quote.id}`} />}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <form action={async () => {
                        "use server";
                        await prisma.quote.delete({ where: { id: quote.id } });
                      }}>
                        <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                      {quote.status !== "Converted" && (
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
