import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { toggleCollectionFavorite } from "@/actions/collections";
import { toast } from "@/lib/toast";

/**
 * Optimistic favorite toggle for a collection card / detail header — the collection
 * twin of `useItemFavoriteToggle`. Same shape: flips optimistically, persists via
 * `toggleCollectionFavorite`, toasts + `router.refresh()` on success so the sidebar's
 * favorite-collections list and the dashboard stats strip don't go stale.
 *
 * `stopPropagation` is baked in for the `CollectionCard` case (button sits inside a
 * `useClickableCard` card); harmless where there's no parent card (`CollectionDetailHeader`).
 */
export function useCollectionFavoriteToggle(
  collection: { id: string; isFavorite: boolean }
): [boolean, (event?: MouseEvent) => Promise<void>] {
  const router = useRouter();
  const [isFavorite, toggle] = useOptimisticToggle(
    collection.isFavorite,
    (next) => toggleCollectionFavorite(collection.id, next),
    "Failed to update favorite",
    (next) => {
      toast.success(next ? "Collection favorited" : "Collection unfavorited");
      router.refresh();
    }
  );

  async function handleToggleFavorite(event?: MouseEvent) {
    event?.stopPropagation();
    await toggle();
  }

  return [isFavorite, handleToggleFavorite];
}
