"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CollectionFormFields } from "@/components/dashboard/CollectionFormFields";
import { updateCollection } from "@/actions/collections";

interface EditCollectionDialogProps {
  collection: { id: string; name: string; description: string | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCollectionDialog({ collection, open, onOpenChange }: EditCollectionDialogProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: collection.name,
    description: collection.description ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // `open` is controlled by the parent (opened via a dropdown item / button,
  // not this component's own trigger), so re-sync the form from `collection`
  // whenever it transitions to open — done during render rather than in an
  // effect, per React's "adjusting state when a prop changes" pattern.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setForm({ name: collection.name, description: collection.description ?? "" });
    }
  }

  async function handleSave() {
    setIsSaving(true);
    const result = await updateCollection(collection.id, {
      name: form.name,
      description: form.description.trim() === "" ? null : form.description,
    });
    setIsSaving(false);

    if (result.success) {
      toast.success("Collection updated");
      onOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to update collection");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit collection</DialogTitle>
          <DialogDescription>Update the name and description of this collection.</DialogDescription>
        </DialogHeader>

        <CollectionFormFields
          idPrefix="edit-collection"
          name={form.name}
          onNameChange={(name) => setForm({ ...form, name })}
          description={form.description}
          onDescriptionChange={(description) => setForm({ ...form, description })}
        />

        <DialogFooter>
          <Button onClick={handleSave} disabled={form.name.trim() === "" || isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
