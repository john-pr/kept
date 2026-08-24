"use client";

import { useRouter } from "next/navigation";
import { type CSSProperties, type MouseEvent } from "react";
import { MoreVertical, Pencil, Star, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CollectionDialogs } from "@/components/dashboard/CollectionDialogs";
import { iconMap } from "@/lib/icon-map";
import type { CollectionSummary } from "@/lib/db/collections";
import { useClickableCard } from "@/hooks/useClickableCard";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { useCollectionDialogs } from "@/hooks/useCollectionDialogs";
import { toggleCollectionFavorite } from "@/actions/collections";

export function CollectionCard({ collection }: { collection: CollectionSummary }) {
  const router = useRouter();
  const { editOpen, setEditOpen, deleteOpen, setDeleteOpen } = useCollectionDialogs();
  const [isFavorite, toggleFavorite] = useOptimisticToggle(
    collection.isFavorite,
    (next) => toggleCollectionFavorite(collection.id, next),
    "Failed to update favorite"
  );
  const clickableCard = useClickableCard(() => router.push(`/collections/${collection.id}`));

  function stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  return (
    <>
      <Card
        className="h-full cursor-pointer ring-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ "--tw-ring-color": collection.borderColor } as CSSProperties}
        role="button"
        tabIndex={0}
        {...clickableCard}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="truncate">{collection.name}</span>
            <div className="flex shrink-0 items-center gap-1" onClick={stopPropagation}>
              {isFavorite && <Star className="size-4 fill-yellow-400 text-yellow-400" />}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Collection actions"
                    />
                  }
                >
                  <MoreVertical className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={toggleFavorite}>
                    <Star className="size-4" />
                    {isFavorite ? "Unfavorite" : "Favorite"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Pencil className="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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

      <CollectionDialogs
        collection={collection}
        editOpen={editOpen}
        onEditOpenChange={setEditOpen}
        deleteOpen={deleteOpen}
        onDeleteOpenChange={setDeleteOpen}
        onDeleted={() => router.refresh()}
      />
    </>
  );
}
