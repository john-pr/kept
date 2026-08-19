"use client";

import { Copy, Download, Pencil, Pin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/items/CodeEditor";
import { MarkdownEditor } from "@/components/items/MarkdownEditor";
import { DeleteItemDialog } from "@/components/items/DeleteItemDialog";
import { formatFileSize } from "@/lib/file-constraints";
import type { ItemDetailResponse } from "@/components/items/ItemDrawer";

interface ItemDrawerViewProps {
  item: ItemDetailResponse;
  showLanguage: boolean;
  showMarkdown: boolean;
  isImage: boolean;
  isDeleting: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onToggleFavorite: () => void;
  onTogglePin: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ItemDrawerView({
  item,
  showLanguage,
  showMarkdown,
  isImage,
  isDeleting,
  onCopy,
  onDownload,
  onToggleFavorite,
  onTogglePin,
  onEdit,
  onDelete,
}: ItemDrawerViewProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        {item.fileUrl ? (
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="size-4" />
            Download
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={onCopy}>
            <Copy className="size-4" />
            Copy
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onToggleFavorite}>
          <Star className={item.isFavorite ? "size-4 fill-yellow-400 text-yellow-400" : "size-4"} />
          {item.isFavorite ? "Unfavorite" : "Favorite"}
        </Button>
        <Button variant="outline" size="sm" onClick={onTogglePin}>
          <Pin className={item.isPinned ? "size-4 fill-current" : "size-4"} />
          {item.isPinned ? "Unpin" : "Pin"}
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onEdit}
          disabled={!item.canEdit}
          title={item.canEdit ? undefined : "You don't have permission to edit this item"}
        >
          <Pencil className="size-4" />
        </Button>
        <DeleteItemDialog
          itemTitle={item.title}
          canDelete={item.canEdit}
          isDeleting={isDeleting}
          onDelete={onDelete}
        />
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
            <CodeEditor
              value={item.content}
              language={item.language}
              readOnly
              title={item.title}
              isPro={item.isPro}
              showExplain
            />
          ) : showMarkdown && item.content ? (
            <MarkdownEditor value={item.content} readOnly />
          ) : (
            <pre className="max-h-80 overflow-auto rounded-md bg-muted p-3 font-mono text-xs text-foreground whitespace-pre-wrap">
              {item.content ?? item.url}
            </pre>
          )}
        </div>
      )}

      {item.fileUrl && isImage && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-medium text-foreground">Preview</h4>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.fileUrl}
            alt={item.fileName ?? item.title}
            className="max-h-80 w-full rounded-md object-contain"
          />
        </div>
      )}

      {item.fileName && (
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-medium text-foreground">File</h4>
          <p className="text-sm text-muted-foreground">
            {item.fileName}
            {item.fileSize != null && ` · ${formatFileSize(item.fileSize)}`}
          </p>
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
  );
}