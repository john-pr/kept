import { getRecentItems } from "@/lib/db/items";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { DashboardGridSection } from "@/components/dashboard/DashboardGridSection";

interface RecentItemsSectionProps {
  userId: string;
}

export async function RecentItemsSection({ userId }: RecentItemsSectionProps) {
  const recentItems = await getRecentItems(userId);

  return (
    <DashboardGridSection title="Recent Items" count={recentItems.length} mobileScroll>
      {recentItems.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </DashboardGridSection>
  );
}
