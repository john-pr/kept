import { collections, items, itemTypes, type Collection, type Item } from "@/lib/mock-data";

export function getItemType(itemTypeId: string) {
  return itemTypes.find((type) => type.id === itemTypeId);
}

export function getCollectionItems(collectionId: string): Item[] {
  return items.filter((item) => item.collectionIds.includes(collectionId));
}

export function getCollectionItemTypeIds(collection: Collection): string[] {
  const ids = getCollectionItems(collection.id).map((item) => item.itemTypeId);
  return Array.from(new Set(ids));
}

export function getRecentItems(limit = 10): Item[] {
  return [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function getPinnedItems(): Item[] {
  return items.filter((item) => item.isPinned);
}

export const dashboardStats = {
  totalItems: items.length,
  totalCollections: collections.length,
  favoriteItems: items.filter((item) => item.isFavorite).length,
  favoriteCollections: collections.filter((collection) => collection.isFavorite).length,
};