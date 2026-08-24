"use client";

import { type CSSProperties, type MouseEvent } from "react";
import { Copy, Pin } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { iconMap } from "@/lib/icon-map";
import type { ItemSummary } from "@/lib/db/items";
import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import { useClickableCard } from "@/hooks/useClickableCard";
import { useItemFavoriteToggle } from "@/hooks/useItemFavoriteToggle";
import { FavoriteToggleButton } from "@/components/items/FavoriteToggleButton";

export function ItemCard({ item }: { item: ItemSummary }) {
  const Icon = iconMap[item.typeIcon];
  const { openItem } = useItemDrawer();
  const clickableCard = useClickableCard(() => openItem(item.id));
  const [isFavorite, handleToggleFavorite] = useItemFavoriteToggle(item);

  function handleCopy(event: MouseEvent) {
    event.stopPropagation();
    navigator.clipboard.writeText(item.content);
    toast.success("Copied to clipboard");
  }

  return (
    <Card
      className="h-full cursor-pointer ring-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ "--tw-ring-color": item.typeColor } as CSSProperties}
      role="button"
      tabIndex={0}
      {...clickableCard}
    >
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-2">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted"
          >
            {Icon && <Icon className="size-4" style={{ color: item.typeColor }} />}
          </span>
          <div className="flex items-center gap-1.5 text-muted-foreground">
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
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <h4 className="truncate text-sm font-medium text-foreground">{item.title}</h4>
        <p className="line-clamp-2 font-mono text-xs text-muted-foreground">
          {item.content}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}