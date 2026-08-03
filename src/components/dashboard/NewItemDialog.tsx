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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ItemTypeSummary } from "@/lib/db/items";
import { createItem } from "@/actions/items";

const CONTENT_SLUGS = new Set(["snippets", "prompts", "commands", "notes"]);
const LANGUAGE_SLUGS = new Set(["snippets", "commands"]);
const URL_SLUGS = new Set(["links"]);
const FILE_SLUGS = new Set(["files", "images"]);

interface NewItemDialogProps {
  itemTypes: ItemTypeSummary[];
  trigger: ReactElement;
  children: ReactNode;
}

const EMPTY_FORM = { title: "", description: "", content: "", language: "", url: "", tags: "" };

export function NewItemDialog({ itemTypes, trigger, children }: NewItemDialogProps) {
  const router = useRouter();
  const selectableTypes = itemTypes.filter((type) => !FILE_SLUGS.has(type.slug));

  const [open, setOpen] = useState(false);
  const [itemTypeId, setItemTypeId] = useState(selectableTypes[0]?.id ?? "");
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const selectedType = selectableTypes.find((type) => type.id === itemTypeId);
  const slug = selectedType?.slug ?? "";
  const showContent = CONTENT_SLUGS.has(slug);
  const showLanguage = LANGUAGE_SLUGS.has(slug);
  const showUrl = URL_SLUGS.has(slug);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setForm(EMPTY_FORM);
      setItemTypeId(selectableTypes[0]?.id ?? "");
    }
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
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
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
          <DialogDescription>Create a new snippet, prompt, command, note, or link.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-item-type">Type</Label>
            <Select value={itemTypeId} onValueChange={(value) => setItemTypeId(value ?? "")}>
              <SelectTrigger id="new-item-type" className="w-full">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {selectableTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="new-item-title">Title</Label>
            <Input
              id="new-item-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="new-item-description">Description</Label>
            <Textarea
              id="new-item-description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {showContent && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-item-content">Content</Label>
              <Textarea
                id="new-item-content"
                className="min-h-32 font-mono text-xs"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </div>
          )}

          {showLanguage && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-item-language">Language</Label>
              <Input
                id="new-item-language"
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
              />
            </div>
          )}

          {showUrl && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-item-url">URL</Label>
              <Input
                id="new-item-url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="new-item-tags">Tags</Label>
            <Input
              id="new-item-tags"
              placeholder="comma, separated, tags"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleCreate}
            disabled={
              !itemTypeId ||
              form.title.trim() === "" ||
              (showUrl && form.url.trim() === "") ||
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