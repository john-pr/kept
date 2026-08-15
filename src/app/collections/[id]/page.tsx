import { notFound } from "next/navigation";
import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { ImageThumbnailCard } from "@/components/dashboard/ImageThumbnailCard";
import { FileListRow } from "@/components/dashboard/FileListRow";
import { CollectionDetailHeader } from "@/components/dashboard/CollectionDetailHeader";
import { getItemTypes, getItemsByCollection } from "@/lib/db/items";
import {
  getCollectionById,
  getCollectionOptions,
  getFavoriteCollections,
  getRecentCollections,
} from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/db/users";
import { groupItemsByType } from "@/lib/item-grouping";

interface CollectionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const { id } = await params;

  const user = await getCurrentUser();
  const [itemTypes, favoriteCollections, recentCollections, collectionOptions, collection] =
    await Promise.all([
      getItemTypes(user.id),
      getFavoriteCollections(user.id),
      getRecentCollections(user.id, 6),
      getCollectionOptions(user.id),
      getCollectionById(id, user.id),
    ]);

  if (!collection) notFound();

  const items = await getItemsByCollection(collection.id, user.id);
  const { imageItems, fileItems, otherItems } = groupItemsByType(items);

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
            <CollectionDetailHeader collection={collection} />
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items in this collection yet.</p>
            ) : (
              <div className="space-y-8">
                {otherItems.length > 0 && (
                  <section className="flex flex-col gap-3">
                    <h3 className="text-sm font-medium text-foreground">Items</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {otherItems.map((item) => (
                        <ItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                )}
                {imageItems.length > 0 && (
                  <section className="flex flex-col gap-3">
                    <h3 className="text-sm font-medium text-foreground">Images</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {imageItems.map((item) => (
                        <ImageThumbnailCard key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                )}
                {fileItems.length > 0 && (
                  <section className="flex flex-col gap-3">
                    <h3 className="text-sm font-medium text-foreground">Files</h3>
                    <div className="rounded-xl border border-border [&>*:last-child]:border-b-0">
                      {fileItems.map((item) => (
                        <FileListRow key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
