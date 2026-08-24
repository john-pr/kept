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

      <div className="flex flex-col gap-2">
        <h4 className="text-sm font-medium text-foreground">Type</h4>
        <p className="text-sm text-muted-foreground">{item.itemType.name}</p>
      </div>

      <CollectionMultiSelect
        options={collectionOptions}
        selectedIds={form.collectionIds}
        onChange={(collectionIds) => setForm({ ...form, collectionIds })}
      />
    </>
  );
}
