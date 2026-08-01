"use client";

import { useEffect, useState } from "react";
import { Copy, Pencil, Pin, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { iconMap } from "@/lib/icon-map";
import type { ItemDetail } from "@/lib/db/items";

type ItemDetailResponse = Omit<ItemDetail, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

interface ItemDrawerProps {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemDrawer({ itemId, open, onOpenChange }: ItemDrawerProps) {
  const [item, setItem] = useState<ItemDetailResponse | null>(null);

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

  const isLoading = !item || item.id !== itemId;
  const Icon = item ? iconMap[item.itemType.icon] : null;

  function handleCopy() {
    if (!item) return;
    const text = item.content ?? item.url ?? "";
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
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
                <Button variant="outline" size="icon-sm">
                  <Pencil className="size-4" />
                </Button>
                <Button variant="outline" size="icon-sm" className="ml-auto text-destructive">
                  <Trash2 className="size-4" />
                </Button>
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
                  <pre className="max-h-80 overflow-auto rounded-md bg-muted p-3 font-mono text-xs text-foreground whitespace-pre-wrap">
                    {item.content ?? item.url}
                  </pre>
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
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}