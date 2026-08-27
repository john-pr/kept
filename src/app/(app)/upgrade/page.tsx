import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/db/users";
import { UpgradePlans } from "@/components/upgrade/UpgradePlans";

export default async function UpgradePage() {
  const user = await getCurrentUser();
  if (user.isPro) {
    redirect("/settings");
  }

  const t = await getTranslations("upgradePage");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 text-center sm:px-6 lg:px-8">
      <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mb-8 text-muted-foreground">{t("subtitle")}</p>

      <UpgradePlans />
    </div>
  );
}
