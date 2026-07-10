import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CollectionsSection } from "@/components/dashboard/CollectionsSection";
import { PinnedItemsSection } from "@/components/dashboard/PinnedItemsSection";
import { RecentItemsSection } from "@/components/dashboard/RecentItemsSection";
import { getItemTypes } from "@/lib/db/items";
import { getFavoriteCollections, getRecentCollections } from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/db/users";

export default async function DashboardPage() {
  const [itemTypes, favoriteCollections, recentCollections, user] = await Promise.all([
    getItemTypes(),
    getFavoriteCollections(),
    getRecentCollections(6),
    getCurrentUser(),
  ]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopBar
        itemTypes={itemTypes}
        favoriteCollections={favoriteCollections}
        recentCollections={recentCollections}
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
            <StatsCards />
            <CollectionsSection />
            <PinnedItemsSection />
            <RecentItemsSection />
          </div>
        </main>
      </div>
    </div>
  );
}
