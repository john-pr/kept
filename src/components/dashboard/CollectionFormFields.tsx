"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CollectionFormFieldsProps {
  /** Prefixes each field's `id`/`htmlFor` (e.g. "new-collection" vs "edit-collection"), keeping ids unique per form. */
  idPrefix: string;
  name: string;
  onNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
}

/** Shared Name + Description fields used by both `NewCollectionDialog` and `EditCollectionDialog`. */
export function CollectionFormFields({
  idPrefix,
  name,
  onNameChange,
  description,
  onDescriptionChange,
}: CollectionFormFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-name`}>Name*</Label>
        <Input
          id={`${idPrefix}-name`}
          placeholder="e.g. React Patterns"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <Textarea
          id={`${idPrefix}-description`}
          placeholder="A short summary of this collection"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>
    </div>
  );
}
