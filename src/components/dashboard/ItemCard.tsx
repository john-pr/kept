"use client";

import { type MouseEvent } from "react";
import { Copy, Pin } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { iconMap } from "@/lib/icon-map";
import { withAlpha } from "@/lib/color";
import { formatRelativeTime } from "@/lib/relative-time";
import type { ItemSummary } from "@/lib/db/items";
import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import { useClickableCard } from "@/hooks/useClickableCard";
import { useItemFavoriteToggle } from "@/hooks/useItemFavoriteToggle";
import { useSoftTintAlpha } from "@/hooks/useSoftTintAlpha";
import { FavoriteToggleButton } from "@/components/items/FavoriteToggleButton";

export function ItemCard({ item }: { item: ItemSummary }) {
  const Icon = iconMap[item.typeIcon];
  const { openItem } = useItemDrawer();
  const clickableCard = useClickableCard(() => openItem(item.id));
  const [isFavorite, handleToggleFavorite] = useItemFavoriteToggle(item);
  const alphaSuffix = useSoftTintAlpha();

  function handleCopy(event: MouseEvent) {
    event.stopPropagation();
    navigator.clipboard.writeText(item.content);
    toast.success("Copied to clipboard");
  }

  return (
    <div
      className="flex h-full cursor-pointer flex-col gap-3 border-l-2 bg-card px-[18px] py-4 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ borderLeftColor: item.typeColor }}
      role="button"
      tabIndex={0}
      {...clickableCard}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="flex items-center gap-1.5 px-1.5 py-0.5 text-[10px] tracking-[0.12em] uppercase"
          style={{ backgroundColor: withAlpha(item.typeColor, alphaSuffix), color: item.typeColor }}
        >
          {Icon && <Icon className="size-3.5" />}
          {item.typeName}
        </span>
        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <span className="text-[10px] tracking-[0.08em] uppercase tabular-nums">
            {formatRelativeTime(new Date(item.createdAt))}
          </span>
          {item.isPinned && <Pin className="size-3.5" />}
          <FavoriteToggleButton isFavorite={isFavorite} onToggle={handleToggleFavorite} />
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
            aria-label="Copy to clipboard"
          >
            <Copy className="size-3.5" />
          </Button>
        </div>
      </div>
      <h4 className="truncate text-sm text-foreground">{item.title}</h4>
      <div className="h-[58px] overflow-hidden border border-border bg-muted p-2.5 font-mono text-xs leading-[18px] text-ink-body">
        {item.content}
      </div>
      <div className="flex flex-wrap gap-2.5">
        {item.tags.map((tag) => (
          <span key={tag} className="text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
            [{tag}]
          </span>
        ))}
      </div>
    </div>
  );
}
