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

const LABEL_CLASS = "text-[10px] tracking-[0.14em] text-muted-foreground uppercase";
const FIELD_CLASS = "rounded-none border-border bg-muted text-[13px]";

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
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-name`} className={LABEL_CLASS}>
          Name*
        </Label>
        <Input
          id={`${idPrefix}-name`}
          placeholder="e.g. React Patterns"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className={`h-[38px] ${FIELD_CLASS}`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-description`} className={LABEL_CLASS}>
          Description
        </Label>
        <Textarea
          id={`${idPrefix}-description`}
          placeholder="A short summary of this collection"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className={FIELD_CLASS}
        />
      </div>
    </div>
  );
}
