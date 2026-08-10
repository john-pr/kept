"use client";

import { Expand, Heart, Pin } from "lucide-react";
import type { ItemSummary } from "@/lib/db/items";
import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import { useClickableCard } from "@/hooks/useClickableCard";

export function ImageThumbnailCard({ item }: { item: ItemSummary }) {
  const { openItem } = useItemDrawer();
  const clickableCard = useClickableCard(() => openItem(item.id));

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
          {item.isFavorite && <Heart className="size-3.5 fill-red-500 text-red-500" />}
        </div>
      </div>
    </div>
  );
}