import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CollectionsSection } from "@/components/dashboard/CollectionsSection";
import { PinnedItemsSection } from "@/components/dashboard/PinnedItemsSection";
import { RecentItemsSection } from "@/components/dashboard/RecentItemsSection";
import { getAllItemsForSearch, getItemTypes } from "@/lib/db/items";
import {
  getCollectionOptions,
  getCollectionsForSearch,
  getFavoriteCollections,
  getRecentCollections,
} from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/db/users";
import { DASHBOARD_COLLECTIONS_LIMIT } from "@/lib/constants";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const [itemTypes, favoriteCollections, recentCollections, collectionOptions, searchItems, searchCollections] =
    await Promise.all([
      getItemTypes(user.id),
      getFavoriteCollections(user.id),
      getRecentCollections(user.id, DASHBOARD_COLLECTIONS_LIMIT),
      getCollectionOptions(user.id),
      getAllItemsForSearch(user.id),
      getCollectionsForSearch(user.id),
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
          <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <StatsCards userId={user.id} />
            <CollectionsSection recentCollections={recentCollections} />
            <PinnedItemsSection userId={user.id} />
            <RecentItemsSection userId={user.id} />
          </div>
        </main>
      </div>
    </div>
  );
}
