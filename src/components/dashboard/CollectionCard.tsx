import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCollectionItemTypeIds, getCollectionItems, getItemType } from "@/lib/dashboard";
import { iconMap } from "@/lib/icon-map";
import type { Collection } from "@/lib/mock-data";

export function CollectionCard({ collection }: { collection: Collection }) {
  const itemCount = getCollectionItems(collection.id).length;
  const typeIds = getCollectionItemTypeIds(collection);

  return (
    <Link href={`/collections/${collection.id}`}>
      <Card className="h-full transition-colors hover:ring-primary/40">
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
              {typeIds.map((typeId) => {
                const type = getItemType(typeId);
                if (!type) return null;
                const Icon = iconMap[type.icon];
                return (
                  <span
                    key={typeId}
                    className="flex size-6 items-center justify-center rounded-md bg-muted"
                  >
                    <Icon className="size-3.5" style={{ color: type.color }} />
                  </span>
                );
              })}
            </div>
            <span className="text-xs text-muted-foreground">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}