import { getTranslations } from "next-intl/server";
import { getPinnedItems } from "@/lib/db/items";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { DashboardGridSection } from "@/components/dashboard/DashboardGridSection";

interface PinnedItemsSectionProps {
  userId: string;
}

export async function PinnedItemsSection({ userId }: PinnedItemsSectionProps) {
  const pinnedItems = await getPinnedItems(userId);

  if (pinnedItems.length === 0) return null;

  const t = await getTranslations("dashboard");

  return (
    <DashboardGridSection title={t("pinnedItems")} count={pinnedItems.length} mobileScroll>
      {pinnedItems.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </DashboardGridSection>
  );
}
