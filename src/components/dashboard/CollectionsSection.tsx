import type { CollectionSummary } from "@/lib/db/collections";
import { CollectionCard } from "@/components/dashboard/CollectionCard";

interface CollectionsSectionProps {
  recentCollections: CollectionSummary[];
}

export function CollectionsSection({ recentCollections }: CollectionsSectionProps) {
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