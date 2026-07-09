import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/constants";
import { ArrowRight } from "lucide-react";

interface LatestItem {
  id: string;
  name: string;
  sku: string;
  coverImage: string;
  askingPrice: number | null;
  availability: string;
  category: { name: string };
  createdAt: Date;
}

const AVAILABILITY_COLORS: Record<string, string> = {
  Available: "bg-emerald-50 text-emerald-700",
  Reserved: "bg-amber-50 text-amber-700",
  Sold: "bg-blue-50 text-blue-700",
  "Not For Sale": "bg-slate-50 text-slate-700",
};

export function LatestItemsWidget({ items }: { items: LatestItem[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Latest Added</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Recently added to inventory</p>
        </div>
        <Link
          href="/admin/items"
          className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground py-8 text-center">No items yet</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/admin/items/${item.id}`}
              className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors -mx-2"
            >
              <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                {item.coverImage && (
                  <Image
                    src={item.coverImage}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.sku} · {item.category.name}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${AVAILABILITY_COLORS[item.availability] || ""}`}>
                  {item.availability}
                </span>
                {item.askingPrice && (
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {formatCurrency(item.askingPrice)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
