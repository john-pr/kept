import { notFound } from "next/navigation";
import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { ImageThumbnailCard } from "@/components/dashboard/ImageThumbnailCard";
import { FileListRow } from "@/components/dashboard/FileListRow";
import { CollectionDetailHeader } from "@/components/dashboard/CollectionDetailHeader";
import { PaginationControls } from "@/components/dashboard/PaginationControls";
import { getAllItemsForSearch, getItemTypes, getItemsByCollection } from "@/lib/db/items";
import {
  getCollectionById,
  getCollectionOptions,
  getCollectionsForSearch,
  getFavoriteCollections,
  getRecentCollections,
} from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/db/users";
import { groupItemsByType } from "@/lib/item-grouping";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { getPageCount, getPageSkip, getValidPage } from "@/lib/pagination";

interface CollectionDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CollectionDetailPage({ params, searchParams }: CollectionDetailPageProps) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = getValidPage(Number(pageParam));

  const user = await getCurrentUser();
  const [
    itemTypes,
    favoriteCollections,
    recentCollections,
    collectionOptions,
    collection,
    searchItems,
    searchCollections,
  ] = await Promise.all([
    getItemTypes(user.id),
    getFavoriteCollections(user.id),
    getRecentCollections(user.id),
    getCollectionOptions(user.id),
    getCollectionById(id, user.id),
    getAllItemsForSearch(user.id),
    getCollectionsForSearch(user.id),
  ]);

  if (!collection) notFound();

  const { items, totalCount } = await getItemsByCollection(
    collection.id,
    user.id,
    getPageSkip(currentPage, ITEMS_PER_PAGE),
    ITEMS_PER_PAGE
  );
  const totalPages = getPageCount(totalCount, ITEMS_PER_PAGE);
  const { imageItems, fileItems, otherItems } = groupItemsByType(items);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar
        itemTypes={itemTypes}
        favoriteCollections={favoriteCollections}
        recentCollections={recentCollections}
        collectionOptions={collectionOptions}
        searchItems={searchItems}
        searchCollections={searchCollections}
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
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/collections/${collection.id}`}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
