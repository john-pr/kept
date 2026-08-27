import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { toggleItemFavorite } from "@/actions/items";
import type { ItemSummary } from "@/lib/db/items";
import { toast } from "@/lib/toast";

/**
 * Optimistic favorite toggle for an item card/row. Wraps `useOptimisticToggle`
 * with `stopPropagation` baked in, since these buttons sit inside a
 * `useClickableCard` card and must not also trigger the card's own click.
 */
export function useItemFavoriteToggle(
  item: Pick<ItemSummary, "id" | "isFavorite">
): [boolean, (event: MouseEvent) => Promise<void>] {
  const router = useRouter();
  const [isFavorite, toggle] = useOptimisticToggle(
    item.isFavorite,
    (next) => toggleItemFavorite(item.id, next),
    "Failed to update favorite",
    (next) => {
      toast.success(next ? "Item favorited" : "Item unfavorited");
      // Refresh so server-rendered favorite counts (dashboard stats strip) and the
      // sidebar's favorites list don't go stale — matches ItemDrawer's behavior.
      router.refresh();
    }
  );

  async function handleToggleFavorite(event: MouseEvent) {
    event.stopPropagation();
    await toggle();
  }

  return [isFavorite, handleToggleFavorite];
}
