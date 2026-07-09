import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { updateCustomer } from "../../actions";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const customer = await prisma.customer.findUnique({
    where: { id },
  });

  if (!customer) notFound();

  // Create bound action with customer ID
  const updateCustomerWithId = updateCustomer.bind(null, customer.id);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="icon" render={<Link href={`/admin/customers/${customer.id}`} />} >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight flex items-center">
          <Edit className="h-6 w-6 mr-3" /> Edit Customer
        </h2>
      </div>

      <div className="max-w-2xl bg-card border rounded-xl p-6 shadow-sm">
        <form action={updateCustomerWithId} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" required defaultValue={customer.name} placeholder="e.g. Rahul Sharma" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" defaultValue={customer.phone || ""} placeholder="+91 9876543210" />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" defaultValue={customer.email || ""} placeholder="rahul@example.com" />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" defaultValue={customer.address || ""} placeholder="Full street address..." rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" defaultValue={customer.city || ""} placeholder="e.g. Mumbai" />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" defaultValue={customer.state || ""} placeholder="e.g. Maharashtra" />
              </div>
              <div>
                <Label htmlFor="pin">PIN Code</Label>
                <Input id="pin" name="pin" defaultValue={customer.pin || ""} placeholder="e.g. 400001" />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" defaultValue={customer.country || "India"} />
              </div>
            </div>

            <div>
              <Label htmlFor="gstNumber">GST Number</Label>
              <Input id="gstNumber" name="gstNumber" defaultValue={customer.gstNumber || ""} placeholder="e.g. 27AADCB2230M1Z2" />
            </div>

            <div>
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea id="notes" name="notes" defaultValue={customer.notes || ""} placeholder="Any private notes about this customer..." rows={3} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" type="button" render={<Link href={`/admin/customers/${customer.id}`} />} >
              Cancel
            </Button>
            <Button type="submit">Update Customer</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
