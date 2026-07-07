import { getRecentCollections } from "@/lib/db/collections";
import { CollectionCard } from "@/components/dashboard/CollectionCard";

export async function CollectionsSection() {
  const recentCollections = await getRecentCollections(6);

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