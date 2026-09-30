"use client";

import { useTranslations } from "next-intl";
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

interface DiscardChangesDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * "Discard unsaved changes?" confirmation, driven by `useDiscardGuard`. Render it *inside*
 * the guarded Dialog/Sheet content so Base UI treats it as a nested dialog — clicks and Esc
 * on it then don't count as dismissing the parent.
 */
export function DiscardChangesDialog({ open, onCancel, onConfirm }: DiscardChangesDialogProps) {
  const t = useTranslations("discardChanges");
  const tc = useTranslations("common");

  return (
    <AlertDialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <AlertDialogContent className="rounded-none border border-border ring-0">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-medium tracking-[0.12em] uppercase">
            {t("title")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-ink-body">{t("body")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="rounded-none border-border bg-muted/40">
          <AlertDialogCancel className="tracking-[0.14em] uppercase">{tc("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="tracking-[0.14em] uppercase"
            onClick={onConfirm}
          >
            {t("discard")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
