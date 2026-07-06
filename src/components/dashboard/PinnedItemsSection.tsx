import { getPinnedItems } from "@/lib/dashboard";
import { ItemCard } from "@/components/dashboard/ItemCard";

export function PinnedItemsSection() {
  const pinnedItems = getPinnedItems();

  if (pinnedItems.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-foreground">Pinned Items</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pinnedItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}