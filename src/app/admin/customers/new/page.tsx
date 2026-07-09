import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { createCustomer } from "../actions";

export default function NewCustomerPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="icon" render={<Link href="/admin/customers" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight flex items-center">
          <UserPlus className="h-6 w-6 mr-3" /> Add New Customer
        </h2>
      </div>

      <div className="max-w-2xl bg-card border rounded-xl p-6 shadow-sm">
        <form action={createCustomer} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" required placeholder="e.g. Rahul Sharma" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" placeholder="+91 9876543210" />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" placeholder="rahul@example.com" />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" name="address" placeholder="Full street address..." rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" placeholder="e.g. Mumbai" />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" placeholder="e.g. Maharashtra" />
              </div>
              <div>
                <Label htmlFor="pin">PIN Code</Label>
                <Input id="pin" name="pin" placeholder="e.g. 400001" />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" defaultValue="India" />
              </div>
            </div>

            <div>
              <Label htmlFor="gstNumber">GST Number</Label>
              <Input id="gstNumber" name="gstNumber" placeholder="e.g. 27AADCB2230M1Z2" />
            </div>

            <div>
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Any private notes about this customer..." rows={3} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" type="button" render={<Link href="/admin/customers" />}>
              Cancel
            </Button>
            <Button type="submit">Create Customer</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
