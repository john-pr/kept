import { getTranslations } from "next-intl/server";
import { getRecentItems } from "@/lib/db/items";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { DashboardGridSection } from "@/components/dashboard/DashboardGridSection";

interface RecentItemsSectionProps {
  userId: string;
}

export async function RecentItemsSection({ userId }: RecentItemsSectionProps) {
  const [recentItems, t] = await Promise.all([
    getRecentItems(userId),
    getTranslations("dashboard"),
  ]);

  return (
    <DashboardGridSection title={t("recentItems")} count={recentItems.length} mobileScroll>
      {recentItems.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </DashboardGridSection>
  );
}
