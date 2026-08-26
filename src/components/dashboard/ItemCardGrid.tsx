import { ItemCard } from "@/components/dashboard/ItemCard";
import { GridFillerCells } from "@/components/dashboard/GridFillerCells";
import type { ItemSummary } from "@/lib/db/items";

const GRID_BREAKPOINTS = [{ cols: 1 }, { prefix: "md", cols: 2 }, { prefix: "lg", cols: 3 }];

export function ItemCardGrid({ items }: { items: ItemSummary[] }) {
  return (
    <div className="grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
      <GridFillerCells itemCount={items.length} breakpoints={GRID_BREAKPOINTS} />
    </div>
  );
}
