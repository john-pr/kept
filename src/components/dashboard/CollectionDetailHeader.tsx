"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EditCollectionDialog } from "@/components/dashboard/EditCollectionDialog";
import { DeleteCollectionDialog } from "@/components/dashboard/DeleteCollectionDialog";
import type { CollectionDetail } from "@/lib/db/collections";
import { toggleCollectionFavorite } from "@/actions/collections";

interface CollectionDetailHeaderProps {
  collection: CollectionDetail;
}

export function CollectionDetailHeader({ collection }: CollectionDetailHeaderProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(collection.isFavorite);

  async function handleToggleFavorite() {
    const next = !isFavorite;
    setIsFavorite(next);
    const result = await toggleCollectionFavorite(collection.id, next);
    if (!result.success) {
      setIsFavorite(!next);
      toast.error(result.error ?? "Failed to update favorite");
    }
  }

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
          onClick={handleToggleFavorite}
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

      <EditCollectionDialog collection={collection} open={editOpen} onOpenChange={setEditOpen} />
      <DeleteCollectionDialog
        collectionId={collection.id}
        collectionName={collection.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onDeleted={() => router.push("/collections")}
      />
    </div>
  );
}
