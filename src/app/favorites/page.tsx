import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { FavoritesList } from "@/components/dashboard/FavoritesList";
import { getAllItemsForSearch, getFavoriteItems, getItemTypes } from "@/lib/db/items";
import {
  getCollectionOptions,
  getCollectionsForSearch,
  getFavoriteCollections,
  getFavoriteCollectionsList,
  getRecentCollections,
} from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/db/users";

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  const [
    itemTypes,
    favoriteCollections,
    recentCollections,
    collectionOptions,
    searchItems,
    searchCollections,
    favoriteItems,
    favoriteCollectionsList,
  ] = await Promise.all([
    getItemTypes(user.id),
    getFavoriteCollections(user.id),
    getRecentCollections(user.id),
    getCollectionOptions(user.id),
    getAllItemsForSearch(user.id),
    getCollectionsForSearch(user.id),
    getFavoriteItems(user.id),
    getFavoriteCollectionsList(user.id),
  ]);

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
          <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-foreground">Favorites</h1>
            <FavoritesList items={favoriteItems} collections={favoriteCollectionsList} />
          </div>
        </main>
      </div>
    </div>
  );
}
