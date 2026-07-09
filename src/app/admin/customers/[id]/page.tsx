import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/constants";
import Link from "next/link";
import { ArrowLeft, User, MapPin, Mail, Phone, FileText, Calendar, Box, Hash, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      invoices: {
        orderBy: { createdAt: "desc" },
        include: { items: true },
      },
    },
  });

  if (!customer) notFound();

  // Metrics calculation
  const totalInvoices = customer.invoices.length;
  const completedInvoices = customer.invoices.filter((inv) => inv.paymentStatus === "Paid");
  
  const lifetimeValue = completedInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const averageOrderValue = completedInvoices.length > 0 ? lifetimeValue / completedInvoices.length : 0;
  
  const totalItemsPurchased = completedInvoices.reduce((sum, inv) => 
    sum + inv.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );

  return (
    <div className="flex flex-col min-h-0 h-full">
      <div className="h-14 flex items-center px-8 border-b border-border bg-card flex-shrink-0 gap-4">
        <Link href="/admin/customers" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <User className="h-4 w-4" /> Customer Profile
        </h1>
        <div className="ml-auto">
          <Button variant="outline" size="sm" render={<Link href={`/admin/customers/${customer.id}/edit`} />}>
            <Edit className="h-4 w-4 mr-2" /> Edit Customer
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 bg-background">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{customer.name}</h2>
              <p className="text-muted-foreground mt-1 text-sm flex items-center gap-3">
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Added on {new Date(customer.createdAt).toLocaleDateString("en-IN")}</span>
                {customer.gstNumber && <span className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" /> GST: {customer.gstNumber}</span>}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Lifetime Value</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(lifetimeValue)}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalInvoices}</div>
                <p className="text-xs text-muted-foreground mt-1">{completedInvoices.length} paid orders</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(averageOrderValue)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Items Purchased</CardTitle>
                <Box className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalItemsPurchased}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/30">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{customer.phone || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="truncate">{customer.email || "-"}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="leading-snug">
                    {[customer.address, customer.city, customer.state, customer.pin, customer.country].filter(Boolean).join(", ") || "No address provided"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notes Section if any */}
          {customer.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{customer.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Order History */}
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Invoice</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Items</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {customer.invoices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          No orders found
                        </td>
                      </tr>
                    ) : (
                      customer.invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <Link href={`/admin/invoices/${inv.id}`} className="font-medium text-blue-600 hover:underline">
                              {inv.invoiceNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {inv.items.length} item(s)
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                              inv.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" :
                              inv.paymentStatus === "Pending" ? "bg-amber-50 text-amber-700 ring-amber-600/20" :
                              "bg-slate-50 text-slate-700 ring-slate-600/20"
                            }`}>
                              {inv.paymentStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {formatCurrency(inv.grandTotal)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
