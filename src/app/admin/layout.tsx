import Link from "next/link";
import { LayoutDashboard, Package, Tag, Settings, Image as ImageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KeyboardShortcuts } from "@/components/admin/KeyboardShortcuts";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <KeyboardShortcuts />
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <h1 className="font-cormorant text-xl font-bold">NB57 Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Button variant="ghost" className="w-full justify-start" render={<Link href="/admin/dashboard" />}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start" render={<Link href="/admin/items" />}>
            <Package className="mr-2 h-4 w-4" />
            Items
          </Button>
          <Button variant="ghost" className="w-full justify-start" render={<Link href="/admin/new-item" />}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
          <Button variant="ghost" className="w-full justify-start" render={<Link href="/admin/categories" />}>
            <Tag className="mr-2 h-4 w-4" />
            Categories
          </Button>
          <Button variant="ghost" className="w-full justify-start" render={<Link href="/admin/images" />}>
            <ImageIcon className="mr-2 h-4 w-4" />
            Images
          </Button>
        </nav>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full" render={<Link href="/" />}>
            View Site
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
