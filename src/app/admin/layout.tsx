import Link from "next/link";
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  Settings, 
  Image as ImageIcon, 
  PenTool, 
  LogOut,
  Database,
  BarChart3,
  Globe,
  FolderTree,
  Heart,
  Activity,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KeyboardShortcuts } from "@/components/admin/KeyboardShortcuts";
import { logout } from "@/app/login/actions";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <KeyboardShortcuts />
      
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col flex-shrink-0">
        <div className="h-14 flex items-center px-6 border-b border-border">
          <h1 className="font-sans text-sm font-semibold tracking-tight text-foreground">Archive Admin</h1>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">Main</div>
          <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10" render={<Link href="/admin/dashboard" />}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10" render={<Link href="/admin/items" />}>
            <Package className="mr-2 h-4 w-4" />
            Inventory
          </Button>
          <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10" render={<Link href="/admin/categories" />}>
            <Tag className="mr-2 h-4 w-4" />
            Categories
          </Button>
          <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10" render={<Link href="/admin/blog" />}>
            <PenTool className="mr-2 h-4 w-4" />
            Blog
          </Button>
          <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10" render={<Link href="/admin/images" />}>
            <ImageIcon className="mr-2 h-4 w-4" />
            Media Library
          </Button>

          <div className="text-xs font-semibold text-muted-foreground mt-6 mb-2 px-2 uppercase tracking-wider">Data</div>
          <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10" render={<Link href="/admin/prices" />}>
            <Database className="mr-2 h-4 w-4" />
            Price Database
          </Button>
          <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10" render={<Link href="/admin/analytics" />}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>

          <div className="text-xs font-semibold text-muted-foreground mt-6 mb-2 px-2 uppercase tracking-wider">Curation</div>
          <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10" render={<Link href="/admin/collections" />}>
            <FolderTree className="mr-2 h-4 w-4" />
            Collections
          </Button>
          <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10" render={<Link href="/admin/wishlist" />}>
            <Heart className="mr-2 h-4 w-4" />
            Wishlist
          </Button>

          <div className="text-xs font-semibold text-muted-foreground mt-6 mb-2 px-2 uppercase tracking-wider">System</div>
          <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10" render={<Link href="/admin/activity" />}>
            <Activity className="mr-2 h-4 w-4" />
            Activity
          </Button>
          <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10" render={<Link href="/" />}>
            <Globe className="mr-2 h-4 w-4" />
            Website
          </Button>
          <Button variant="ghost" className="w-full justify-start h-8 px-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10" render={<Link href="/admin/settings" />}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </nav>
        <div className="p-4 border-t border-border">
          <form action={logout}>
            <Button variant="ghost" className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-start h-8 px-2 text-sm" type="submit">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col min-w-0">
        {children}
      </main>

    </div>
  );
}
