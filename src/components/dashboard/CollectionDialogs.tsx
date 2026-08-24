"use client";

import { EditCollectionDialog } from "@/components/dashboard/EditCollectionDialog";
import { DeleteCollectionDialog } from "@/components/dashboard/DeleteCollectionDialog";

interface CollectionDialogsProps {
  collection: { id: string; name: string; description: string | null };
  editOpen: boolean;
  onEditOpenChange: (open: boolean) => void;
  deleteOpen: boolean;
  onDeleteOpenChange: (open: boolean) => void;
  /** Called after a successful delete — e.g. `router.refresh()` from a list, or `router.push(...)` away from the collection's own now-gone detail page. */
  onDeleted: () => void;
}

/** Shared Edit/Delete dialog pair used by `CollectionCard` and `CollectionDetailHeader`. */
export function CollectionDialogs({
  collection,
  editOpen,
  onEditOpenChange,
  deleteOpen,
  onDeleteOpenChange,
  onDeleted,
}: CollectionDialogsProps) {
  return (
    <>
      <EditCollectionDialog collection={collection} open={editOpen} onOpenChange={onEditOpenChange} />
      <DeleteCollectionDialog
        collectionId={collection.id}
        collectionName={collection.name}
        open={deleteOpen}
        onOpenChange={onDeleteOpenChange}
        onDeleted={onDeleted}
      />
    </>
  );
}
