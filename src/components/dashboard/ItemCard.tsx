import type { CSSProperties } from "react";
import { Heart, Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { iconMap } from "@/lib/icon-map";
import type { ItemSummary } from "@/lib/db/items";

export function ItemCard({ item }: { item: ItemSummary }) {
  const Icon = iconMap[item.typeIcon];

  return (
    <Card
      className="h-full ring-2"
      style={{ "--tw-ring-color": item.typeColor } as CSSProperties}
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
            {item.isFavorite && (
              <Heart className="size-3.5 fill-red-500 text-red-500" />
            )}
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