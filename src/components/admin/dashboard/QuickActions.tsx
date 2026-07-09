import Link from "next/link";
import {
  Plus,
  FileText,
  CalendarClock,
  Upload,
  PenTool,
  Download,
  Search,
} from "lucide-react";

const ACTIONS = [
  { href: "/admin/new-item", icon: Plus, label: "Add Item", color: "text-blue-600 bg-blue-50" },
  { href: "/admin/invoices/new", icon: FileText, label: "Generate Invoice", color: "text-emerald-600 bg-emerald-50" },
  { href: "/admin/reservations/new", icon: CalendarClock, label: "Reserve Item", color: "text-amber-600 bg-amber-50" },
  { href: "/admin/images", icon: Upload, label: "Upload Images", color: "text-violet-600 bg-violet-50" },
  { href: "/admin/blog/new", icon: PenTool, label: "Create Blog", color: "text-pink-600 bg-pink-50" },
  { href: "/admin/items", icon: Search, label: "Search Inventory", color: "text-slate-600 bg-slate-50" },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      {ACTIONS.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
        >
          <div className={`rounded-md p-1 ${action.color}`}>
            <action.icon className="h-3.5 w-3.5" />
          </div>
          {action.label}
        </Link>
      ))}
    </div>
  );
}
