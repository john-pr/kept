"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New collection</DialogTitle>
          <DialogDescription>Group items together under a new collection.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-collection-name">Name*</Label>
            <Input
              id="new-collection-name"
              placeholder="e.g. React Patterns"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="new-collection-description">Description</Label>
            <Textarea
              id="new-collection-description"
              placeholder="A short summary of this collection"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleCreate} disabled={form.name.trim() === "" || isSaving}>
            {isSaving ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
