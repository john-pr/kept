import { getPinnedItems } from "@/lib/db/items";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { DashboardGridSection } from "@/components/dashboard/DashboardGridSection";

interface PinnedItemsSectionProps {
  userId: string;
}

export async function PinnedItemsSection({ userId }: PinnedItemsSectionProps) {
  const pinnedItems = await getPinnedItems(userId);

  if (pinnedItems.length === 0) return null;

  return (
    <DashboardGridSection title="Pinned Items" count={pinnedItems.length}>
      {pinnedItems.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </DashboardGridSection>
  );
}
