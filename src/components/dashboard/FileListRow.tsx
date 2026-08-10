"use client";

import { Download, Heart, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { iconMap } from "@/lib/icon-map";
import { getFileIconName } from "@/lib/file-icon";
import { formatFileSize } from "@/lib/file-constraints";
import type { ItemSummary } from "@/lib/db/items";
import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import { useClickableCard } from "@/hooks/useClickableCard";

export function FileListRow({ item }: { item: ItemSummary }) {
  const { openItem } = useItemDrawer();
  const clickableCard = useClickableCard(() => openItem(item.id));
  const Icon = iconMap[getFileIconName(item.fileName ?? item.title)];

  function handleDownload(event: React.MouseEvent) {
    event.stopPropagation();
    window.open(`/api/download/${item.id}`, "_blank");
  }

  return (
    <div
      className="flex cursor-pointer flex-col gap-2 border-b border-border px-4 py-3 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:gap-4"
      role="button"
      tabIndex={0}
      {...clickableCard}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted"
        >
          {Icon && <Icon className="size-4" style={{ color: item.typeColor }} />}
        </span>
        <div className="min-w-0">
          <h4 className="truncate text-sm font-medium text-foreground">{item.title}</h4>
          {item.fileName && (
            <p className="truncate text-xs text-muted-foreground">{item.fileName}</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4 pl-12 text-xs text-muted-foreground sm:pl-0">
        <span className="w-16 shrink-0">
          {item.fileSize != null ? formatFileSize(item.fileSize) : "—"}
        </span>
        <span className="w-24 shrink-0">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {item.isPinned && <Pin className="size-3.5" />}
          {item.isFavorite && <Heart className="size-3.5 fill-red-500 text-red-500" />}
        </div>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="size-4" />
          Download
        </Button>
      </div>
    </div>
  );
}