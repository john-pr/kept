import { FREE_COLLECTION_LIMIT, FREE_ITEM_LIMIT } from "@/lib/plan-limits";
import { pluralize } from "@/lib/text";

/** Shared Free/Pro feature copy, used by the homepage pricing section and the /upgrade page. */
export const FREE_FEATURES = [
  `${pluralize(FREE_ITEM_LIMIT, "item")} total`,
  pluralize(FREE_COLLECTION_LIMIT, "collection"),
  "All text-based types",
  "Basic search",
];

export const PRO_FEATURES = [
  "Unlimited items",
  "Unlimited collections",
  "File & image uploads",
  "AI auto-tagging & summaries",
  "Data export (JSON/ZIP)",
];
