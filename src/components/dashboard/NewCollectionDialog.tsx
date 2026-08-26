"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CollectionFormFields } from "@/components/dashboard/CollectionFormFields";
import { createCollection } from "@/actions/collections";

interface NewCollectionDialogProps {
  trigger: ReactElement;
  children: ReactNode;
}

const EMPTY_FORM = {
  name: "",
  description: "",
};

export function NewCollectionDialog({ trigger, children }: NewCollectionDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setForm(EMPTY_FORM);
    }
  }

  async function handleCreate() {
    setIsSaving(true);
    const result = await createCollection({
      name: form.name,
      description: form.description.trim() === "" ? null : form.description,
    });
    setIsSaving(false);

    if (result.success) {
      toast.success("Collection created");
      handleOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to create collection");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger}>{children}</DialogTrigger>
      <DialogContent className="gap-5 rounded-none border border-border ring-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-medium tracking-[0.12em] uppercase">
            New collection
          </DialogTitle>
          <DialogDescription>Group items together under a new collection.</DialogDescription>
        </DialogHeader>

        <CollectionFormFields
          idPrefix="new-collection"
          name={form.name}
          onNameChange={(name) => setForm({ ...form, name })}
          description={form.description}
          onDescriptionChange={(description) => setForm({ ...form, description })}
        />

        <DialogFooter className="-mx-4 -mb-4 rounded-none border-t border-border bg-muted/40 p-4">
          <Button
            onClick={handleCreate}
            disabled={form.name.trim() === "" || isSaving}
            className="tracking-[0.14em] uppercase"
          >
            {isSaving ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
