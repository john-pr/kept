import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
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
  const [itemCount, collectionCount, t] = await Promise.all([
    getItemCountForUser(user.id),
    getCollectionCountForUser(user.id),
    getTranslations("settingsPage"),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("billing")}</CardTitle>
          <CardDescription>
            {user.isPro ? t("billingProDescription") : t("billingFreeDescription")}
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
              stripeCustomerId={user.stripeCustomerId}
              stripeSubscriptionStatus={user.stripeSubscriptionStatus}
              stripeCurrentPeriodEnd={user.stripeCurrentPeriodEnd}
            />
          </Suspense>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("editorPreferences")}</CardTitle>
          <CardDescription>{t("editorPreferencesDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <EditorPreferencesSection />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("security")}</CardTitle>
          <CardDescription>
            {user.hasPassword ? t("securityHasPassword") : t("securityGithub")}
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
          <CardTitle>{t("dangerZone")}</CardTitle>
          <CardDescription>{t("dangerZoneDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountDialog />
        </CardContent>
      </Card>
    </div>
  );
}
