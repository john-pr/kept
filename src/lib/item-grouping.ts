import type { ItemSummary } from "@/lib/db/items";

export interface GroupedItems {
  imageItems: ItemSummary[];
  fileItems: ItemSummary[];
  otherItems: ItemSummary[];
}

/**
 * Splits a mixed-type item list (e.g. a collection's items) into image/file/other
 * buckets for rendering with the appropriate card component. `typeName` comes
 * straight from `ItemType.name`, which isn't guaranteed to be lowercase in the DB,
 * so the comparison is case-insensitive.
 */
export function groupItemsByType(items: ItemSummary[]): GroupedItems {
  const imageItems: ItemSummary[] = [];
  const fileItems: ItemSummary[] = [];
  const otherItems: ItemSummary[] = [];

  for (const item of items) {
    const typeName = item.typeName.toLowerCase();
    if (typeName === "image") {
      imageItems.push(item);
    } else if (typeName === "file") {
      fileItems.push(item);
    } else {
      otherItems.push(item);
    }
  }

  return { imageItems, fileItems, otherItems };
}
