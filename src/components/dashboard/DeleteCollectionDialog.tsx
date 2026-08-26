"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteCollection } from "@/actions/collections";

interface DeleteCollectionDialogProps {
  collectionId: string;
  collectionName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful delete instead of the default `router.refresh()` — use this to redirect away from a page that no longer exists (e.g. the collection's own detail page). */
  onDeleted?: () => void;
}

export function DeleteCollectionDialog({
  collectionId,
  collectionName,
  open,
  onOpenChange,
  onDeleted,
}: DeleteCollectionDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteCollection(collectionId);
    setIsDeleting(false);

    if (result.success) {
      toast.success("Collection deleted");
      onOpenChange(false);
      if (onDeleted) {
        onDeleted();
      } else {
        router.refresh();
      }
    } else {
      toast.error(result.error ?? "Failed to delete collection");
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete collection</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete &quot;{collectionName}&quot;. Items in this collection will not be
            deleted — they will just no longer belong to it. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isDeleting} onClick={handleDelete}>
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
