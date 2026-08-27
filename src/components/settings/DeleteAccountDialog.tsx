"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/lib/toast";

// The word the user must type to confirm. Kept as a literal (matched
// case-insensitively) rather than translated — it's a fixed safety token, and
// the localized prompt shows it verbatim via the `<b>delete</b>` placeholder.
const CONFIRM_WORD = "delete";

export function DeleteAccountDialog() {
  const router = useRouter();
  const t = useTranslations("deleteAccount");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = confirmText.trim().toLowerCase() === CONFIRM_WORD;

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setConfirmText("");
    }
  }

  async function handleDelete() {
    setIsDeleting(true);

    const response = await fetch("/api/auth/delete-account", { method: "POST" });
    const result = await response.json();

    if (!result.success) {
      setIsDeleting(false);
      toast.error(result.error ?? tc("somethingWentWrong"));
      return;
    }

    await signOut({ redirect: false });
    router.push("/sign-in");
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        <Trash2 className="size-4" />
        {t("open")}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("body")}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="delete-confirm">
            {t.rich("confirmPrompt", {
              b: (chunks) => <span className="font-semibold text-foreground">{chunks}</span>,
            })}
          </Label>
          <Input
            id="delete-confirm"
            autoComplete="off"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{tc("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={!canDelete || isDeleting}
            onClick={handleDelete}
          >
            {isDeleting && <Loader2 className="size-4 animate-spin" />}
            {t("confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
