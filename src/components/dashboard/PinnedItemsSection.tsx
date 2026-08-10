import { getPinnedItems } from "@/lib/db/items";
import { ItemCard } from "@/components/dashboard/ItemCard";

interface PinnedItemsSectionProps {
  userId: string;
}

export async function PinnedItemsSection({ userId }: PinnedItemsSectionProps) {
  const pinnedItems = await getPinnedItems(userId);

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