"use client";

import { useRouter } from "next/navigation";
import { type MouseEvent } from "react";
import { MoreVertical, Pencil, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CollectionDialogs } from "@/components/dashboard/CollectionDialogs";
import { iconMap } from "@/lib/icon-map";
import { withAlpha } from "@/lib/color";
import type { CollectionSummary } from "@/lib/db/collections";
import { useClickableCard } from "@/hooks/useClickableCard";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { useCollectionDialogs } from "@/hooks/useCollectionDialogs";
import { useSoftTintAlpha } from "@/hooks/useSoftTintAlpha";
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
  const alphaSuffix = useSoftTintAlpha();

  function stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  return (
    <>
      <div
        className="flex min-h-[126px] cursor-pointer flex-col gap-2.5 border-l-2 bg-card px-[18px] py-4 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ borderLeftColor: collection.borderColor }}
        role="button"
        tabIndex={0}
        {...clickableCard}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="truncate text-sm text-foreground">{collection.name}</span>
          <div className="flex shrink-0 items-center gap-2" onClick={stopPropagation}>
            {isFavorite && <span className="mt-0.5 size-[9px] bg-primary" />}
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
        </div>
        <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-ink-body">
          {collection.description}
        </p>
        <div className="flex items-center justify-between border-t border-dotted border-border pt-2.5">
          <div className="flex items-center gap-1.5">
            {collection.types.map((type) => {
              const Icon = iconMap[type.icon];
              if (!Icon) return null;
              return (
                <span
                  key={type.id}
                  className="flex size-6 items-center justify-center"
                  style={{ backgroundColor: withAlpha(type.color, alphaSuffix) }}
                >
                  <Icon className="size-3.5" style={{ color: type.color }} />
                </span>
              );
            })}
          </div>
          <span className="text-[11px] tracking-[0.1em] text-muted-foreground uppercase tabular-nums">
            {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

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
