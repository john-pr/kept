import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BillingSection } from "@/components/settings/BillingSection";
import { ChangePasswordSection } from "@/components/settings/ChangePasswordSection";
import { DeleteAccountDialog } from "@/components/settings/DeleteAccountDialog";
import { EditorPreferencesSection } from "@/components/settings/EditorPreferencesSection";
import { getCurrentUser } from "@/lib/db/users";
import { getItemCountForUser } from "@/lib/db/items";
import { getCollectionCountForUser } from "@/lib/db/collections";
import { FREE_ITEM_LIMIT, FREE_COLLECTION_LIMIT } from "@/lib/plan-limits";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const [itemCount, collectionCount] = await Promise.all([
    getItemCountForUser(user.id),
    getCollectionCountForUser(user.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-foreground">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>
            {user.isPro ? "Manage your DevStash Pro subscription." : "Upgrade to Pro for unlimited items and collections."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <BillingSection
              isPro={user.isPro}
              itemCount={itemCount}
              itemLimit={FREE_ITEM_LIMIT}
              collectionCount={collectionCount}
              collectionLimit={FREE_COLLECTION_LIMIT}
              stripeSubscriptionStatus={user.stripeSubscriptionStatus}
              stripeCurrentPeriodEnd={user.stripeCurrentPeriodEnd}
            />
          </Suspense>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Editor Preferences</CardTitle>
          <CardDescription>
            Customize how the code editor looks and behaves. Changes save automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditorPreferencesSection />
        </CardContent>
      </Card>

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
  );
}
