"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
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
import { toast } from "sonner";

const CONFIRM_WORD = "delete";

export function DeleteAccountDialog() {
  const router = useRouter();
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
      toast.error(result.error ?? "Something went wrong");
      return;
    }

    await signOut({ redirect: false });
    router.push("/sign-in");
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        <Trash2 className="size-4" />
        Delete account
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete account</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete your account and all of your items and collections. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="delete-confirm">
            Type <span className="font-semibold text-foreground">delete</span> to confirm
          </Label>
          <Input
            id="delete-confirm"
            autoComplete="off"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={!canDelete || isDeleting}
            onClick={handleDelete}
          >
            {isDeleting && <Loader2 className="size-4 animate-spin" />}
            Delete account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}