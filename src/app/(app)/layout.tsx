import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileTabBar } from "@/components/dashboard/MobileTabBar";
import { MobileNavProvider } from "@/components/dashboard/MobileNavContext";
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
    <MobileNavProvider>
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
          {/* pb-36 (144px) clears both the tab bar (56px) and the FAB's fixed footprint
              (bottom-[76px] + 52px tall = 128px from the viewport bottom), so the last card
              in any scrollable list can be scrolled fully clear of the FAB — see the
              ui-reviewer finding on the FAB permanently covering trailing content. */}
          <main className="flex-1 overflow-y-auto p-4 pb-36 md:pb-4">{children}</main>
        </div>
        <MobileTabBar
          itemTypes={itemTypes}
          collectionOptions={collectionOptions}
          isPro={user.isPro}
        />
      </div>
    </MobileNavProvider>
  );
}
