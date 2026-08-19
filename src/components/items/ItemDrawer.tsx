"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { iconMap } from "@/lib/icon-map";
import type { ItemDetail } from "@/lib/db/items";
import type { CollectionOption } from "@/lib/db/collections";
import { deleteItem, toggleItemFavorite, toggleItemPin, updateItem } from "@/actions/items";
import { ItemDrawerView } from "@/components/items/ItemDrawerView";
import { ItemDrawerEditForm } from "@/components/items/ItemDrawerEditForm";

export type ItemDetailResponse = Omit<ItemDetail, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
  collectionOptions: CollectionOption[];
  isPro: boolean;
};

interface ItemDrawerProps {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CONTENT_TYPES = new Set(["snippet", "prompt", "command", "note"]);
const LANGUAGE_TYPES = new Set(["snippet", "command"]);
const MARKDOWN_TYPES = new Set(["prompt", "note"]);
const URL_TYPES = new Set(["link"]);

export interface EditFormState {
  title: string;
  description: string;
  content: string;
  language: string;
  url: string;
  tags: string;
  collectionIds: string[];
}

function toFormState(item: ItemDetailResponse): EditFormState {
  return {
    title: item.title,
    description: item.description ?? "",
    content: item.content ?? "",
    language: item.language ?? "",
    url: item.url ?? "",
    tags: item.tags.join(", "),
    collectionIds: item.collections.map((collection) => collection.id),
  };
}

export function ItemDrawer({ itemId, open, onOpenChange }: ItemDrawerProps) {
  const router = useRouter();
  const [item, setItem] = useState<ItemDetailResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<EditFormState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!open || !itemId) return;

    let cancelled = false;

    fetch(`/api/items/${itemId}`)
      .then((res) => res.json())
      .then((result) => {
        if (cancelled) return;
        if (result.success) {
          setItem(result.data);
        } else {
          toast.error(result.error ?? "Failed to load item");
          onOpenChange(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        toast.error("Failed to load item");
        onOpenChange(false);
      });

    return () => {
      cancelled = true;
    };
  }, [itemId, open, onOpenChange]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setIsEditing(false);
      setForm(null);
    }
    onOpenChange(nextOpen);
  }

  const isLoading = !item || item.id !== itemId;
  const Icon = item ? iconMap[item.itemType.icon] : null;
  const typeName = item?.itemType.name.toLowerCase() ?? "";
  const showContent = CONTENT_TYPES.has(typeName);
  const showLanguage = LANGUAGE_TYPES.has(typeName);
  const showMarkdown = MARKDOWN_TYPES.has(typeName);
  const showUrl = URL_TYPES.has(typeName);
  const isImage = typeName === "image";

  function handleDownload() {
    if (!item) return;
    window.open(`/api/download/${item.id}`, "_blank");
  }

  function handleCopy() {
    if (!item) return;
    const text = item.content ?? item.url ?? "";
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  function handleEdit() {
    if (!item || !item.canEdit) return;
    setForm(toFormState(item));
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
    setForm(null);
  }

  async function handleSave() {
    if (!item || !form) return;

    setIsSaving(true);
    const result = await updateItem(item.id, {
      title: form.title,
      description: form.description.trim() === "" ? null : form.description,
      content: showContent ? (form.content.trim() === "" ? null : form.content) : item.content,
      language: showLanguage ? (form.language.trim() === "" ? null : form.language) : item.language,
      url: showUrl ? (form.url.trim() === "" ? null : form.url) : item.url,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
      collectionIds: form.collectionIds,
    });
    setIsSaving(false);

    if (result.success && result.data) {
      setItem({
        ...result.data,
        createdAt: result.data.createdAt.toString(),
        updatedAt: result.data.updatedAt.toString(),
        canEdit: item.canEdit,
        collectionOptions: item.collectionOptions,
        isPro: item.isPro,
      });
      setIsEditing(false);
      setForm(null);
      toast.success("Item updated");
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to update item");
    }
  }

  async function handleToggleFavorite() {
    if (!item) return;

    const next = !item.isFavorite;
    setItem({ ...item, isFavorite: next });
    const result = await toggleItemFavorite(item.id, next);
    if (!result.success) {
      setItem((current) => (current ? { ...current, isFavorite: !next } : current));
      toast.error(result.error ?? "Failed to update favorite");
    }
    router.refresh();
  }

  async function handleTogglePin() {
    if (!item) return;

    const next = !item.isPinned;
    setItem({ ...item, isPinned: next });
    const result = await toggleItemPin(item.id, next);
    if (!result.success) {
      setItem((current) => (current ? { ...current, isPinned: !next } : current));
      toast.error(result.error ?? "Failed to update pin");
    } else {
      toast.success(next ? "Item pinned" : "Item unpinned");
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!item) return;

    setIsDeleting(true);
    const result = await deleteItem(item.id);
    setIsDeleting(false);

    if (result.success) {
      toast.success("Item deleted");
      handleOpenChange(false);
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to delete item");
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="gap-0 overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
        {isLoading || !item ? (
          <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className="size-9 animate-pulse rounded-md bg-muted" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
              </div>
            </div>
            <div className="h-8 w-full animate-pulse rounded bg-muted" />
            <div className="h-32 w-full animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                  {Icon && <Icon className="size-4" style={{ color: item.itemType.color }} />}
                </span>
                <div className="flex flex-col">
                  <SheetTitle>{item.title}</SheetTitle>
                  <span className="text-xs text-muted-foreground">
                    Created {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </SheetHeader>

            <div className="flex flex-col gap-6 p-4">
              {isEditing && form ? (
                <ItemDrawerEditForm
                  item={item}
                  form={form}
                  setForm={setForm}
                  showContent={showContent}
                  showLanguage={showLanguage}
                  showMarkdown={showMarkdown}
                  showUrl={showUrl}
                  collectionOptions={item.collectionOptions}
                  isSaving={isSaving}
                  isPro={item.isPro}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              ) : (
                <ItemDrawerView
                  item={item}
                  showLanguage={showLanguage}
                  showMarkdown={showMarkdown}
                  isImage={isImage}
                  isDeleting={isDeleting}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                  onToggleFavorite={handleToggleFavorite}
                  onTogglePin={handleTogglePin}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}