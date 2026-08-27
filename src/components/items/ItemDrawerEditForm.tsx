"use client";

import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollectionMultiSelect } from "@/components/items/CollectionMultiSelect";
import { ItemFormFields } from "@/components/items/ItemFormFields";
import type { ItemDetailResponse, EditFormState } from "@/components/items/ItemDrawer";
import type { CollectionOption } from "@/lib/db/collections";
import { appendTagToInput } from "@/lib/tags";

interface ItemDrawerEditFormProps {
  item: ItemDetailResponse;
  form: EditFormState;
  setForm: (form: EditFormState) => void;
  showContent: boolean;
  showLanguage: boolean;
  showMarkdown: boolean;
  showUrl: boolean;
  collectionOptions: CollectionOption[];
  isSaving: boolean;
  isPro: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function ItemDrawerEditForm({
  item,
  form,
  setForm,
  showContent,
  showLanguage,
  showMarkdown,
  showUrl,
  collectionOptions,
  isSaving,
  isPro,
  onSave,
  onCancel,
}: ItemDrawerEditFormProps) {
  function handleAcceptTag(tag: string) {
    setForm({ ...form, tags: appendTagToInput(form.tags, tag) });
  }
  return (
    <>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onSave} disabled={form.title.trim() === "" || isSaving}>
          <Save className="size-4" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
        <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
          <X className="size-4" />
          Cancel
        </Button>
      </div>

      <ItemFormFields
        idPrefix="item"
        title={form.title}
        onTitleChange={(title) => setForm({ ...form, title })}
        description={form.description}
        onDescriptionChange={(description) => setForm({ ...form, description })}
        content={form.content}
        onContentChange={(content) => setForm({ ...form, content })}
        language={form.language}
        onLanguageChange={(language) => setForm({ ...form, language })}
        url={form.url}
        onUrlChange={(url) => setForm({ ...form, url })}
        tags={form.tags}
        onTagsChange={(tags) => setForm({ ...form, tags })}
        onAcceptTag={handleAcceptTag}
        showContent={showContent}
        showLanguage={showLanguage}
        showMarkdown={showMarkdown}
        showUrl={showUrl}
        isPro={isPro}
        fileName={item.fileName}
      />

      <div className="flex flex-col gap-1.5">
        {/* Match the LABEL_CLASS used by the ItemFormFields / CollectionMultiSelect
            labels flanking this one — the rest of ItemDrawerEditForm is still
            known-unstyled, but an orphaned bold Title Case label next to uppercase
            tracked siblings reads as a bug (ui-reviewer finding). */}
        <h4 className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">Type</h4>
        <p className="text-[13px] text-foreground">{item.itemType.name}</p>
      </div>

      <CollectionMultiSelect
        options={collectionOptions}
        selectedIds={form.collectionIds}
        onChange={(collectionIds) => setForm({ ...form, collectionIds })}
      />
    </>
  );
}
