import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { getAllItemsForSearch, getItemTypes } from "@/lib/db/items";
import {
  getCollectionOptions,
  getCollectionsForSearch,
  getFavoriteCollections,
  getRecentCollections,
} from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/db/users";
import { getSessionUserId } from "@/lib/db/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const userId = await getSessionUserId();
  const [user, itemTypes, favoriteCollections, recentCollections, collectionOptions, searchItems, searchCollections] =
    await Promise.all([
      getCurrentUser(),
      getItemTypes(userId),
      getFavoriteCollections(userId),
      getRecentCollections(userId),
      getCollectionOptions(userId),
      getAllItemsForSearch(userId),
      getCollectionsForSearch(userId),
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
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
