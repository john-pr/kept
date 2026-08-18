import { getRecentCollections } from "@/lib/db/collections";
import { DASHBOARD_COLLECTIONS_LIMIT } from "@/lib/constants";
import { CollectionCard } from "@/components/dashboard/CollectionCard";

interface CollectionsSectionProps {
  userId: string;
}

export async function CollectionsSection({ userId }: CollectionsSectionProps) {
  const recentCollections = await getRecentCollections(userId, DASHBOARD_COLLECTIONS_LIMIT);

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-foreground">Recent Collections</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recentCollections.map((collection) => (
          <CollectionCard key={collection.id} collection={collection} />
        ))}
      </div>
    </section>
  );
}
