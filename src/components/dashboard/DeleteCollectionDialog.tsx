"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("itemForm");
  const tc = useTranslations("common");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteCollection(collectionId);
    setIsDeleting(false);

    if (result.success) {
      toast.success(t("toasts.collectionDeleted"));
      onOpenChange(false);
      if (onDeleted) {
        onDeleted();
      } else {
        router.refresh();
      }
    } else {
      toast.error(result.error ?? t("toasts.failedDeleteCollection"));
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("deleteCollectionTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("deleteCollectionBody", { name: collectionName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{tc("cancel")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isDeleting} onClick={handleDelete}>
            {isDeleting ? tc("deleting") : tc("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
