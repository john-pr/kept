import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { PaginationControls } from "@/components/dashboard/PaginationControls";
import { getAllItemsForSearch, getItemTypes } from "@/lib/db/items";
import {
  getAllCollections,
  getCollectionOptions,
  getCollectionsForSearch,
  getFavoriteCollections,
  getRecentCollections,
} from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/db/users";
import { COLLECTIONS_PER_PAGE } from "@/lib/constants";
import { getPageCount, getPageSkip, getValidPage } from "@/lib/pagination";

interface CollectionsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const { page: pageParam } = await searchParams;
  const currentPage = getValidPage(Number(pageParam));

  const user = await getCurrentUser();
  const [
    itemTypes,
    favoriteCollections,
    recentCollections,
    collectionOptions,
    { collections: allCollections, totalCount },
    searchItems,
    searchCollections,
  ] = await Promise.all([
    getItemTypes(user.id),
    getFavoriteCollections(user.id),
    getRecentCollections(user.id),
    getCollectionOptions(user.id),
    getAllCollections(user.id, getPageSkip(currentPage, COLLECTIONS_PER_PAGE), COLLECTIONS_PER_PAGE),
    getAllItemsForSearch(user.id),
    getCollectionsForSearch(user.id),
  ]);

  const totalPages = getPageCount(totalCount, COLLECTIONS_PER_PAGE);

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
            <PaginationControls currentPage={currentPage} totalPages={totalPages} basePath="/collections" />
          </div>
        </main>
      </div>
    </div>
  );
}
