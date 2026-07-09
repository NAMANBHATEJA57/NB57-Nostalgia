import {
  Package,
  FileText,
  Users,
  CalendarClock,
  Tag,
  PenTool,
  BookOpen,
  Pencil,
  Trash2,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  admin: string | null;
  timestamp: Date;
}

const ENTITY_ICONS: Record<string, React.ElementType> = {
  Item: Package,
  Invoice: FileText,
  Customer: Users,
  Reservation: CalendarClock,
  Category: Tag,
  Blog: PenTool,
  Ledger: BookOpen,
};

const ACTION_ICONS: Record<string, React.ElementType> = {
  Created: CheckCircle,
  Updated: Pencil,
  Deleted: Trash2,
  StatusChanged: TrendingUp,
};

function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function ActivityTimeline({ logs }: { logs: ActivityLog[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Latest actions in the system</p>
      </div>
      {logs.length === 0 ? (
        <p className="text-xs text-muted-foreground py-8 text-center">No activity recorded yet</p>
      ) : (
        <div className="space-y-0">
          {logs.map((log, index) => {
            const EntityIcon = ENTITY_ICONS[log.entity] || Package;
            const ActionIcon = ACTION_ICONS[log.action] || CheckCircle;
            const isLast = index === logs.length - 1;

            return (
              <div key={log.id} className="flex gap-3 relative">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-[13px] top-8 w-px h-[calc(100%-8px)] bg-border" />
                )}
                {/* Icon */}
                <div className="relative z-10 flex-shrink-0 h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                  <EntityIcon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                {/* Content */}
                <div className="flex-1 pb-4 min-w-0">
                  <p className="text-xs text-foreground">
                    <span className="font-medium">{log.action}</span>{" "}
                    <span className="text-muted-foreground">{log.entity}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {log.admin || "Admin"} · {getRelativeTime(log.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
