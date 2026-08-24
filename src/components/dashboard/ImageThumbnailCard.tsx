"use client";

import { type MouseEvent } from "react";
import { Expand, Pin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ItemSummary } from "@/lib/db/items";
import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import { useClickableCard } from "@/hooks/useClickableCard";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { toggleItemFavorite } from "@/actions/items";

export function ImageThumbnailCard({ item }: { item: ItemSummary }) {
  const { openItem } = useItemDrawer();
  const clickableCard = useClickableCard(() => openItem(item.id));
  const [isFavorite, toggleFavorite] = useOptimisticToggle(
    item.isFavorite,
    (next) => toggleItemFavorite(item.id, next),
    "Failed to update favorite"
  );

  async function handleToggleFavorite(event: MouseEvent) {
    event.stopPropagation();
    await toggleFavorite();
  }

  return (
    <div
      className="group flex h-44 cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      role="button"
      tabIndex={0}
      {...clickableCard}
    >
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {item.fileUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.fileUrl}
            alt={item.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-muted text-sm text-muted-foreground">
            No preview
          </div>
        )}

        {/* expand affordance on hover */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity duration-300 group-hover:bg-black/10 group-hover:opacity-100">
          <span className="flex size-9 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
            <Expand className="size-4 text-white" />
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border bg-card px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="size-2 shrink-0 rounded-full ring-1 ring-border"
            style={{ backgroundColor: item.typeColor }}
          />
          <h4 className="truncate text-sm font-medium text-foreground">{item.title}</h4>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
          {item.isPinned && <Pin className="size-3.5" />}
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleToggleFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={isFavorite ? "size-3.5 fill-yellow-400 text-yellow-400" : "size-3.5"} />
          </Button>
        </div>
      </div>
    </div>
  );
}