import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      invoices: {
        select: { id: true, grandTotal: true, paymentStatus: true }
      }
    }
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        <Button render={<Link href="/admin/customers/new" />}>
          <Plus className="h-4 w-4 mr-2" /> Add Customer
        </Button>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Lifetime Value</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground h-32">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => {
                const completedInvoices = customer.invoices.filter((inv) => inv.paymentStatus === "Paid");
                const lifetimeValue = completedInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

                return (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">{customer.phone || "-"}</div>
                      <div className="text-xs text-muted-foreground">{customer.email || "-"}</div>
                    </TableCell>
                    <TableCell>
                      {[customer.city, customer.state].filter(Boolean).join(", ") || "-"}
                    </TableCell>
                    <TableCell className="text-right">{customer.invoices.length}</TableCell>
                    <TableCell className="text-right font-medium text-emerald-600">
                      ₹{lifetimeValue.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(customer.createdAt), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" render={<Link href={`/admin/customers/${customer.id}`} />}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
