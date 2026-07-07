import Link from "next/link";
import type { CSSProperties } from "react";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { iconMap } from "@/lib/icon-map";
import type { CollectionSummary } from "@/lib/db/collections";

export function CollectionCard({ collection }: { collection: CollectionSummary }) {
  return (
    <Link href={`/collections/${collection.id}`}>
      <Card
        className="h-full ring-2 transition-colors"
        style={{ "--tw-ring-color": collection.borderColor } as CSSProperties}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="truncate">{collection.name}</span>
            {collection.isFavorite && (
              <Star className="size-4 shrink-0 fill-yellow-400 text-yellow-400" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between gap-3">
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {collection.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {collection.types.map((type) => {
                const Icon = iconMap[type.icon];
                if (!Icon) return null;
                return (
                  <span
                    key={type.id}
                    className="flex size-6 items-center justify-center rounded-md bg-muted"
                  >
                    <Icon className="size-3.5" style={{ color: type.color }} />
                  </span>
                );
              })}
            </div>
            <span className="text-xs text-muted-foreground">
              {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}