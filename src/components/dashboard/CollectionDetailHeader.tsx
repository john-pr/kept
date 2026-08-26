"use client";

import { useRouter } from "next/navigation";
import { Pencil, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollectionDialogs } from "@/components/dashboard/CollectionDialogs";
import type { CollectionDetail } from "@/lib/db/collections";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { useCollectionDialogs } from "@/hooks/useCollectionDialogs";
import { toggleCollectionFavorite } from "@/actions/collections";
import { toast } from "@/lib/toast";

interface CollectionDetailHeaderProps {
  collection: CollectionDetail;
}

export function CollectionDetailHeader({ collection }: CollectionDetailHeaderProps) {
  const router = useRouter();
  const { editOpen, setEditOpen, deleteOpen, setDeleteOpen } = useCollectionDialogs();
  const [isFavorite, toggleFavorite] = useOptimisticToggle(
    collection.isFavorite,
    (next) => toggleCollectionFavorite(collection.id, next),
    "Failed to update favorite",
    (next) => toast.success(next ? "Collection favorited" : "Collection unfavorited")
  );

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <h1 className="truncate text-2xl font-semibold text-foreground">{collection.name}</h1>
        {collection.description && (
          <p className="text-sm text-muted-foreground">{collection.description}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={toggleFavorite}
          title={isFavorite ? "Unfavorite" : "Favorite"}
        >
          <Star className={isFavorite ? "size-4 fill-yellow-400 text-yellow-400" : "size-4"} />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setEditOpen(true)}
          title="Edit collection"
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          className="text-destructive"
          onClick={() => setDeleteOpen(true)}
          title="Delete collection"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <CollectionDialogs
        collection={collection}
        editOpen={editOpen}
        onEditOpenChange={setEditOpen}
        deleteOpen={deleteOpen}
        onDeleteOpenChange={setDeleteOpen}
        onDeleted={() => router.push("/collections")}
      />
    </div>
  );
}
