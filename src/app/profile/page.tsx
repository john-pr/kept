import { Package, FolderOpen } from "lucide-react";
import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { getCurrentUser } from "@/lib/db/users";
import { getProfileStats } from "@/lib/db/stats";
import { getAllItemsForSearch, getItemTypes } from "@/lib/db/items";
import {
  getCollectionOptions,
  getCollectionsForSearch,
  getFavoriteCollections,
  getRecentCollections,
} from "@/lib/db/collections";
import { iconMap } from "@/lib/icon-map";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const [
    itemTypes,
    favoriteCollections,
    recentCollections,
    stats,
    collectionOptions,
    searchItems,
    searchCollections,
  ] = await Promise.all([
    getItemTypes(user.id),
    getFavoriteCollections(user.id),
    getRecentCollections(user.id, 6),
    getProfileStats(user.id),
    getCollectionOptions(user.id),
    getAllItemsForSearch(user.id),
    getCollectionsForSearch(user.id),
  ]);

  const memberSince = user.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
          <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-foreground">Profile</h1>

            <Card>
              <CardHeader className="flex-row items-center gap-4">
                <UserAvatar name={user.name} image={user.image} size="lg" />
                <div className="flex flex-col gap-1">
                  <CardTitle className="flex items-center gap-2">
                    {user.name}
                    <Badge variant={user.isPro ? "default" : "secondary"}>
                      {user.isPro ? "Pro" : "Free"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Member since {memberSince}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Package className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-semibold text-foreground">
                        {stats.totalItems}
                      </span>
                      <span className="text-xs text-muted-foreground">Total Items</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <FolderOpen className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-semibold text-foreground">
                        {stats.totalCollections}
                      </span>
                      <span className="text-xs text-muted-foreground">Collections</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium tracking-wide text-muted-foreground">
                    By Type
                  </span>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {stats.itemTypeBreakdown.map((type) => {
                      const Icon = iconMap[type.icon];
                      return (
                        <div
                          key={type.id}
                          className="flex items-center gap-2 rounded-lg border border-border p-2.5"
                        >
                          {Icon && (
                            <Icon className="size-4 shrink-0" style={{ color: type.color }} />
                          )}
                          <span className="flex-1 truncate text-sm text-foreground">
                            {type.name}
                          </span>
                          <span className="text-sm font-medium text-muted-foreground">
                            {type.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}