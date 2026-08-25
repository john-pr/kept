import { getRecentCollections } from "@/lib/db/collections";
import { DASHBOARD_COLLECTIONS_LIMIT } from "@/lib/constants";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { DashboardGridSection } from "@/components/dashboard/DashboardGridSection";

interface CollectionsSectionProps {
  userId: string;
}

export async function CollectionsSection({ userId }: CollectionsSectionProps) {
  const recentCollections = await getRecentCollections(userId, DASHBOARD_COLLECTIONS_LIMIT);

  return (
    <DashboardGridSection title="Recent Collections" count={recentCollections.length}>
      {recentCollections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </DashboardGridSection>
  );
}
