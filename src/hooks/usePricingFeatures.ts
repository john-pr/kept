"use client";

import { useTranslations } from "next-intl";
import { FREE_COLLECTION_LIMIT, FREE_ITEM_LIMIT } from "@/lib/plan-limits";

/**
 * Localized Free/Pro feature bullet lists for the pricing cards (homepage,
 * `/upgrade`, `/settings` billing). The two numeric limits stay wired to the
 * real `plan-limits` constants; everything else comes from the `pricing`
 * message namespace.
 */
export function usePricingFeatures() {
  const t = useTranslations("pricing");

  return {
    free: [
      t("itemsTotal", { count: FREE_ITEM_LIMIT }),
      t("collectionsCount", { count: FREE_COLLECTION_LIMIT }),
      t("allTextTypes"),
      t("basicSearch"),
    ],
    pro: [
      t("unlimitedItems"),
      t("unlimitedCollections"),
      t("fileUploads"),
      t("aiAutoTagging"),
      t("dataExport"),
    ],
  };
}
