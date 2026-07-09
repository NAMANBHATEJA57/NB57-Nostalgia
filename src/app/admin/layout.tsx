import Link from "next/link";
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  Settings, 
  Image as ImageIcon, 
  PenTool, 
  LogOut,
  BarChart3,
  Globe,
  Activity,
  FileText,
  Users,
  CalendarClock,
  TrendingUp,
  Calculator,
  Search,
  MessageCircle,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { KeyboardShortcuts } from "@/components/admin/KeyboardShortcuts";
import { logout } from "@/app/login/actions";

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/admin/items", icon: Package, label: "Inventory" },
      { href: "/admin/categories", icon: Tag, label: "Categories" },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/invoices", icon: FileText, label: "Invoices" },
      { href: "/admin/leads", icon: MessageCircle, label: "Leads" },
      { href: "/admin/calculator", icon: Calculator, label: "Calculator" },
      { href: "/admin/customers", icon: Users, label: "Customers" },
      { href: "/admin/reservations", icon: CalendarClock, label: "Reservations" },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/admin/profit", icon: TrendingUp, label: "Profit & Loss" },
      { href: "/admin/ledger", icon: BookOpen, label: "Ledger" },
      { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/blog", icon: PenTool, label: "Blog" },
      { href: "/admin/images", icon: ImageIcon, label: "Media Library" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/activity", icon: Activity, label: "Activity Log" },
      { href: "/", icon: Globe, label: "Website" },
      { href: "/admin/settings", icon: Settings, label: "Settings" },
    ],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background print:block print:min-h-0 print:h-auto">
      <KeyboardShortcuts />
      
      {/* Left Sidebar */}
      <aside className="w-60 border-r border-border bg-card flex flex-col flex-shrink-0 print:hidden">
        <div className="h-14 flex items-center px-5 border-b border-border">
          <h1 className="font-sans text-sm font-semibold tracking-tight text-foreground">
            NB57&apos;s Nostalgia
          </h1>
        </div>

        {/* Global Search Input */}
        <div className="px-3 pt-3 pb-1">
          <form action="/admin/items" method="get">
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="search"
                name="q"
                placeholder="Search items..."
                className="w-full rounded-lg border border-border bg-muted/40 py-2 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground hover:bg-muted focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
              />
            </div>
          </form>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="text-[10px] font-semibold text-muted-foreground mb-1.5 px-2 uppercase tracking-widest">
                {section.label}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className="w-full justify-start h-8 px-2 text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent/10"
                    render={<Link href={item.href} />}
                  >
                    <item.icon className="mr-2.5 h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <form action={logout}>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-start h-8 px-2 text-[13px]"
              type="submit"
            >
              <LogOut className="mr-2.5 h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto print:overflow-visible flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}
