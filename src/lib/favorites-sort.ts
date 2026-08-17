import type { FavoriteItem } from "@/lib/db/items";
import type { FavoriteCollection } from "@/lib/db/collections";

export type FavoritesSortOption = "newest" | "oldest" | "name-asc" | "name-desc" | "type";

export const FAVORITES_SORT_OPTIONS: { value: FavoritesSortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "type", label: "Item Type" },
];

export const FAVORITES_SORT_LABELS: Record<FavoritesSortOption, string> = {
  newest: "Newest",
  oldest: "Oldest",
  "name-asc": "Name A-Z",
  "name-desc": "Name Z-A",
  type: "Item Type",
};

function byDate(direction: "newest" | "oldest") {
  return (a: { updatedAt: Date }, b: { updatedAt: Date }) => {
    const diff = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    return direction === "newest" ? -diff : diff;
  };
}

export function sortFavoriteItems(
  items: FavoriteItem[],
  sort: FavoritesSortOption,
): FavoriteItem[] {
  const sorted = [...items];
  switch (sort) {
    case "name-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "name-desc":
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    case "type":
      return sorted.sort((a, b) => a.typeName.localeCompare(b.typeName));
    case "oldest":
      return sorted.sort(byDate("oldest"));
    case "newest":
    default:
      return sorted.sort(byDate("newest"));
  }
}

export function sortFavoriteCollections(
  collections: FavoriteCollection[],
  sort: FavoritesSortOption,
): FavoriteCollection[] {
  const sorted = [...collections];
  switch (sort) {
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    // Collections have no item type — fall back to sorting by name.
    case "type":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "oldest":
      return sorted.sort(byDate("oldest"));
    case "newest":
    default:
      return sorted.sort(byDate("newest"));
  }
}
