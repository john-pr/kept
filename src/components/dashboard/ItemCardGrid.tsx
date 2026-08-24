import { ItemCard } from "@/components/dashboard/ItemCard";
import type { ItemSummary } from "@/lib/db/items";

export function ItemCardGrid({ items }: { items: ItemSummary[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
