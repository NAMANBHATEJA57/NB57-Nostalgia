import { formatCurrency } from "@/lib/constants";
import Image from "next/image";
import Link from "next/link";

interface ValuableItem {
  id: string;
  name: string;
  sku: string;
  coverImage: string;
  askingPrice: number | null;
  availability: string;
  category: { name: string };
}

export function MostValuableItems({ items }: { items: ValuableItem[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Most Valuable Items</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Highest valued in your collection</p>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground py-8 text-center">No priced items yet</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <Link
              key={item.id}
              href={`/admin/items/${item.id}`}
              className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors -mx-2"
            >
              <span className="text-xs font-medium text-muted-foreground w-5 text-center tabular-nums">
                {index + 1}
              </span>
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
              <span className="text-sm font-semibold text-foreground tabular-nums flex-shrink-0">
                {item.askingPrice ? formatCurrency(item.askingPrice) : "–"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
