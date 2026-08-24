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
import { Label } from "@/components/ui/label";
import { FileUpload, type UploadedFile } from "@/components/items/FileUpload";
import { CollectionMultiSelect } from "@/components/items/CollectionMultiSelect";
import { ItemFormFields } from "@/components/items/ItemFormFields";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ItemTypeSummary } from "@/lib/db/items";
import type { CollectionOption } from "@/lib/db/collections";
import { createItem } from "@/actions/items";
import { iconMap } from "@/lib/icon-map";
import { appendTagToInput, parseTagsInput } from "@/lib/tags";
import { singularize } from "@/lib/text";

const CONTENT_SLUGS = new Set(["snippets", "prompts", "commands", "notes"]);
const LANGUAGE_SLUGS = new Set(["snippets", "commands"]);
const MARKDOWN_SLUGS = new Set(["prompts", "notes"]);
const URL_SLUGS = new Set(["links"]);
const FILE_SLUGS = new Set(["files", "images"]);

interface NewItemDialogProps {
  itemTypes: ItemTypeSummary[];
  collectionOptions: CollectionOption[];
  trigger: ReactElement;
  children: ReactNode;
  /** Preselect and lock the type picker to this item type id (e.g. from a type-specific page). */
  defaultItemTypeId?: string;
  /** Shows the AI "Suggest Tags" button. Pro-only feature — omit/false hides it. */
  isPro?: boolean;
}

const EMPTY_FORM = {
  title: "",
  description: "",
  content: "",
  language: "",
  url: "",
  tags: "",
  file: null as UploadedFile | null,
  collectionIds: [] as string[],
};

export function NewItemDialog({
  itemTypes,
  collectionOptions,
  trigger,
  children,
  defaultItemTypeId,
  isPro = false,
}: NewItemDialogProps) {
  const router = useRouter();
  const selectableTypes = itemTypes;
  const isTypeLocked = Boolean(
    defaultItemTypeId && selectableTypes.some((type) => type.id === defaultItemTypeId),
  );
  const initialTypeId = isTypeLocked ? defaultItemTypeId! : selectableTypes[0]?.id ?? "";

  const [open, setOpen] = useState(false);
  const [itemTypeId, setItemTypeId] = useState(initialTypeId);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const selectedType = selectableTypes.find((type) => type.id === itemTypeId);
  const slug = selectedType?.slug ?? "";
  const SelectedTypeIcon = selectedType ? iconMap[selectedType.icon] : undefined;
  const showContent = CONTENT_SLUGS.has(slug);
  const showLanguage = LANGUAGE_SLUGS.has(slug);
  const showMarkdown = MARKDOWN_SLUGS.has(slug);
  const showUrl = URL_SLUGS.has(slug);
  const showFile = FILE_SLUGS.has(slug);
  const uploadKind = slug === "images" ? "image" : "file";

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setForm(EMPTY_FORM);
      setItemTypeId(initialTypeId);
    }
  }

  function handleAcceptTag(tag: string) {
    setForm({ ...form, tags: appendTagToInput(form.tags, tag) });
  }

  async function handleCreate() {
    if (!itemTypeId) return;

    setIsSaving(true);
    const result = await createItem({
      itemTypeId,
      title: form.title,
      description: form.description.trim() === "" ? null : form.description,
      content: showContent ? (form.content.trim() === "" ? null : form.content) : null,
      language: showLanguage ? (form.language.trim() === "" ? null : form.language) : null,
      url: showUrl ? (form.url.trim() === "" ? null : form.url) : null,
      fileUrl: showFile ? (form.file?.fileUrl ?? null) : null,
      fileName: showFile ? (form.file?.fileName ?? null) : null,
      fileSize: showFile ? (form.file?.fileSize ?? null) : null,
      tags: parseTagsInput(form.tags),
      collectionIds: form.collectionIds,
    });
    setIsSaving(false);

    if (result.success) {
      toast.success("Item created");
      handleOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to create item");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger}>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New item</DialogTitle>
          <DialogDescription>
            Create a new snippet, prompt, command, note, link, file, or image.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-item-type">Type</Label>
            <Select
              value={itemTypeId}
              onValueChange={(value) => setItemTypeId(value ?? "")}
              disabled={isTypeLocked}
            >
              <SelectTrigger id="new-item-type" className="w-full">
                <SelectValue placeholder="Select a type">
                  {selectedType ? (
                    <span className="flex items-center gap-1.5">
                      {SelectedTypeIcon && (
                        <SelectedTypeIcon
                          className="size-4"
                          style={{ color: selectedType.color }}
                        />
                      )}
                      {singularize(selectedType.name)}
                    </span>
                  ) : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false}>
                {selectableTypes.map((type) => {
                  const TypeIcon = iconMap[type.icon];
                  return (
                    <SelectItem key={type.id} value={type.id} label={singularize(type.name)}>
                      {TypeIcon && <TypeIcon className="size-4" style={{ color: type.color }} />}
                      {singularize(type.name)}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <ItemFormFields
            idPrefix="new-item"
            placeholders
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
            fileName={showFile ? form.file?.fileName ?? null : null}
          >
            {showFile && (
              <div className="flex flex-col gap-2">
                <Label>{uploadKind === "image" ? "Image" : "File"}</Label>
                <FileUpload
                  kind={uploadKind}
                  value={form.file}
                  onChange={(file) => setForm({ ...form, file })}
                />
              </div>
            )}
          </ItemFormFields>

          <CollectionMultiSelect
            options={collectionOptions}
            selectedIds={form.collectionIds}
            onChange={(collectionIds) => setForm({ ...form, collectionIds })}
          />
        </div>

        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={
              !itemTypeId ||
              form.title.trim() === "" ||
              (showUrl && form.url.trim() === "") ||
              (showFile && !form.file) ||
              isSaving
            }
          >
            {isSaving ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}