"use client";

import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CodeEditor } from "@/components/items/CodeEditor";
import { MarkdownEditor } from "@/components/items/MarkdownEditor";
import { CollectionMultiSelect } from "@/components/items/CollectionMultiSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ItemDetailResponse, EditFormState } from "@/components/items/ItemDrawer";
import type { CollectionOption } from "@/lib/db/collections";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { SuggestTagsButton } from "@/components/items/SuggestTagsButton";

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
    const currentTags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    setForm({ ...form, tags: [...currentTags, tag].join(", ") });
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="item-title">Title</Label>
        <Input
          id="item-title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="item-description">Description</Label>
        <Textarea
          id="item-description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      {showLanguage && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="item-language">Language</Label>
          <Select
            value={form.language}
            onValueChange={(value) => setForm({ ...form, language: value ?? "" })}
          >
            <SelectTrigger id="item-language" className="w-full">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {LANGUAGE_OPTIONS.map((lang) => (
                <SelectItem key={lang.value} value={lang.value} label={lang.label}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showContent && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="item-content">Content</Label>
          {showLanguage ? (
            <CodeEditor
              value={form.content}
              onChange={(value) => setForm({ ...form, content: value })}
              language={form.language || undefined}
            />
          ) : showMarkdown ? (
            <MarkdownEditor
              value={form.content}
              onChange={(value) => setForm({ ...form, content: value })}
            />
          ) : (
            <Textarea
              id="item-content"
              className="min-h-32 font-mono text-xs"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          )}
        </div>
      )}

      {showUrl && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="item-url">URL</Label>
          <Input
            id="item-url"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="item-tags">Tags</Label>
        <Input
          id="item-tags"
          placeholder="comma, separated, tags"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
        />
        {isPro && (
          <SuggestTagsButton
            title={form.title}
            content={showContent ? form.content : (form.description || null)}
            existingTags={form.tags
              .split(",")
              .map((t) => t.trim())
              .filter((t) => t.length > 0)}
            onAcceptTag={handleAcceptTag}
          />
        )}
      </div>

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