import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { getItemTypes } from "@/lib/db/items";
import {
  getAllCollections,
  getCollectionOptions,
  getFavoriteCollections,
  getRecentCollections,
} from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/db/users";

export default async function CollectionsPage() {
  const user = await getCurrentUser();
  const [itemTypes, favoriteCollections, recentCollections, collectionOptions, allCollections] =
    await Promise.all([
      getItemTypes(user.id),
      getFavoriteCollections(user.id),
      getRecentCollections(user.id, 6),
      getCollectionOptions(user.id),
      getAllCollections(user.id),
    ]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar
        itemTypes={itemTypes}
        favoriteCollections={favoriteCollections}
        recentCollections={recentCollections}
        collectionOptions={collectionOptions}
        user={user}
      />
      <div className="flex min-h-0 flex-1">
        <Sidebar
          itemTypes={itemTypes}
          favoriteCollections={favoriteCollections}
          recentCollections={recentCollections}
          user={user}
        />
        <main className="flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-foreground">Collections</h1>
            {allCollections.length === 0 ? (
              <p className="text-sm text-muted-foreground">No collections yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {allCollections.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
