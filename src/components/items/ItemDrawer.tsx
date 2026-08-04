"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Pencil, Pin, Save, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CodeEditor } from "@/components/items/CodeEditor";
import { iconMap } from "@/lib/icon-map";
import type { ItemDetail } from "@/lib/db/items";
import { deleteItem, updateItem } from "@/actions/items";

type ItemDetailResponse = Omit<ItemDetail, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
  canEdit: boolean;
};

interface ItemDrawerProps {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CONTENT_TYPES = new Set(["snippet", "prompt", "command", "note"]);
const LANGUAGE_TYPES = new Set(["snippet", "command"]);
const URL_TYPES = new Set(["link"]);

interface EditFormState {
  title: string;
  description: string;
  content: string;
  language: string;
  url: string;
  tags: string;
}

function toFormState(item: ItemDetailResponse): EditFormState {
  return {
    title: item.title,
    description: item.description ?? "",
    content: item.content ?? "",
    language: item.language ?? "",
    url: item.url ?? "",
    tags: item.tags.join(", "),
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
  const showUrl = URL_TYPES.has(typeName);

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
    });
    setIsSaving(false);

    if (result.success && result.data) {
      setItem({
        ...result.data,
        createdAt: result.data.createdAt.toString(),
        updatedAt: result.data.updatedAt.toString(),
        canEdit: item.canEdit,
      });
      setIsEditing(false);
      setForm(null);
      toast.success("Item updated");
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to update item");
    }
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
                <>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleSave} disabled={form.title.trim() === "" || isSaving}>
                      <Save className="size-4" />
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
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

                  {showContent && (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="item-content">Content</Label>
                      {showLanguage ? (
                        <CodeEditor
                          value={form.content}
                          onChange={(value) => setForm({ ...form, content: value })}
                          language={form.language || undefined}
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

                  {showLanguage && (
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="item-language">Language</Label>
                      <Input
                        id="item-language"
                        value={form.language}
                        onChange={(e) => setForm({ ...form, language: e.target.value })}
                      />
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
                  </div>

                  <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-medium text-foreground">Type</h4>
                    <p className="text-sm text-muted-foreground">{item.itemType.name}</p>
                  </div>

                  {item.collections.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <h4 className="text-sm font-medium text-foreground">Collections</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {item.collections.map((collection) => (
                          <Badge key={collection.id} variant="secondary">
                            {collection.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="size-4" />
                      Copy
                    </Button>
                    <Button variant="outline" size="icon-sm">
                      <Star
                        className={
                          item.isFavorite ? "size-4 fill-yellow-400 text-yellow-400" : "size-4"
                        }
                      />
                    </Button>
                    <Button variant="outline" size="icon-sm">
                      <Pin className={item.isPinned ? "size-4 fill-current" : "size-4"} />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={handleEdit}
                      disabled={!item.canEdit}
                      title={item.canEdit ? undefined : "You don't have permission to edit this item"}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button
                            variant="outline"
                            size="icon-sm"
                            className="ml-auto text-destructive"
                            disabled={!item.canEdit}
                            title={
                              item.canEdit
                                ? undefined
                                : "You don't have permission to delete this item"
                            }
                          />
                        }
                      >
                        <Trash2 className="size-4" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete item</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete &quot;{item.title}&quot;. This action
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={handleDelete}
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {item.description && (
                    <div className="flex flex-col gap-2">
                      <h4 className="text-sm font-medium text-foreground">Description</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  )}

                  {(item.content || item.url) && (
                    <div className="flex flex-col gap-2">
                      <h4 className="text-sm font-medium text-foreground">Content</h4>
                      {showLanguage && item.content ? (
                        <CodeEditor value={item.content} language={item.language} readOnly />
                      ) : (
                        <pre className="max-h-80 overflow-auto rounded-md bg-muted p-3 font-mono text-xs text-foreground whitespace-pre-wrap">
                          {item.content ?? item.url}
                        </pre>
                      )}
                    </div>
                  )}

                  {item.fileName && (
                    <div className="flex flex-col gap-2">
                      <h4 className="text-sm font-medium text-foreground">File</h4>
                      <p className="text-sm text-muted-foreground">{item.fileName}</p>
                    </div>
                  )}

                  {item.tags.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <h4 className="text-sm font-medium text-foreground">Tags</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.collections.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <h4 className="text-sm font-medium text-foreground">Collections</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {item.collections.map((collection) => (
                          <Badge key={collection.id} variant="secondary">
                            {collection.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}