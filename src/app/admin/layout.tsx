import Link from "next/link";
import { LayoutDashboard, Package, Tag, Settings, Image as ImageIcon, Plus, PenTool, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KeyboardShortcuts } from "@/components/admin/KeyboardShortcuts";
import { logout } from "@/app/login/actions";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen admin-bg">
      <KeyboardShortcuts />
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card/70 backdrop-blur-xl flex flex-col shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <h1 className="font-heading text-xl font-bold tracking-tight">NB57 Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Button variant="ghost" className="w-full justify-start hover:bg-accent/10 hover:text-accent" render={<Link href="/admin/dashboard" />}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-accent/10 hover:text-accent" render={<Link href="/admin/items" />}>
            <Package className="mr-2 h-4 w-4" />
            Items
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-accent/10 hover:text-accent" render={<Link href="/admin/new-item" />}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-accent/10 hover:text-accent" render={<Link href="/admin/categories" />}>
            <Tag className="mr-2 h-4 w-4" />
            Categories
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-accent/10 hover:text-accent" render={<Link href="/admin/images" />}>
            <ImageIcon className="mr-2 h-4 w-4" />
            Images
          </Button>
          <Button variant="ghost" className="w-full justify-start hover:bg-accent/10 hover:text-accent" render={<Link href="/admin/blog" />}>
            <PenTool className="mr-2 h-4 w-4" />
            Blog
          </Button>
        </nav>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full mb-2" render={<Link href="/" />}>
            View Site
          </Button>
          <form action={logout}>
            <Button variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 justify-start" type="submit">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
