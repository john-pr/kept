import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordSection } from "@/components/settings/ChangePasswordSection";
import { DeleteAccountDialog } from "@/components/settings/DeleteAccountDialog";
import { getCurrentUser } from "@/lib/db/users";
import { getAllItemsForSearch, getItemTypes } from "@/lib/db/items";
import {
  getCollectionOptions,
  getCollectionsForSearch,
  getFavoriteCollections,
  getRecentCollections,
} from "@/lib/db/collections";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const [
    itemTypes,
    favoriteCollections,
    recentCollections,
    collectionOptions,
    searchItems,
    searchCollections,
  ] = await Promise.all([
    getItemTypes(user.id),
    getFavoriteCollections(user.id),
    getRecentCollections(user.id, 6),
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
          <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-foreground">Settings</h1>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>
                  {user.hasPassword
                    ? "Update the password used to sign in."
                    : "You sign in with GitHub, so there's no password to manage."}
                </CardDescription>
              </CardHeader>
              {user.hasPassword && (
                <CardContent>
                  <ChangePasswordSection />
                </CardContent>
              )}
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
                <CardDescription>
                  Permanently delete your account and all of your items and collections.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DeleteAccountDialog />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
