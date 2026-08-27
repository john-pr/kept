import { getTranslations } from "next-intl/server";
import { getRecentCollections } from "@/lib/db/collections";
import { DASHBOARD_COLLECTIONS_LIMIT } from "@/lib/constants";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { DashboardGridSection } from "@/components/dashboard/DashboardGridSection";

interface CollectionsSectionProps {
  userId: string;
}

export async function CollectionsSection({ userId }: CollectionsSectionProps) {
  const [recentCollections, t] = await Promise.all([
    getRecentCollections(userId, DASHBOARD_COLLECTIONS_LIMIT),
    getTranslations("dashboard"),
  ]);

  return (
    <DashboardGridSection title={t("recentCollections")} count={recentCollections.length}>
      {recentCollections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </DashboardGridSection>
  );
}
