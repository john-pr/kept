import { getTranslations } from "next-intl/server";
import { FavoritesList } from "@/components/dashboard/FavoritesList";
import { getFavoriteItems } from "@/lib/db/items";
import { getFavoriteCollectionsList } from "@/lib/db/collections";
import { getSessionUserId } from "@/lib/db/session";

export default async function FavoritesPage() {
  const userId = await getSessionUserId();
  const [favoriteItems, favoriteCollectionsList, t] = await Promise.all([
    getFavoriteItems(userId),
    getFavoriteCollectionsList(userId),
    getTranslations("favoritesPage"),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
      <FavoritesList items={favoriteItems} collections={favoriteCollectionsList} />
    </div>
  );
}
