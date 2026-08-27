"use client";

import { useTranslations } from "next-intl";
import { Copy, Download, Pencil, Pin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/items/CodeEditor";
import { MarkdownEditor } from "@/components/items/MarkdownEditor";
import { DeleteItemDialog } from "@/components/items/DeleteItemDialog";
import { formatFileSize } from "@/lib/file-constraints";
import type { ItemDetailResponse } from "@/components/items/ItemDrawer";

// Dotted-divider section-label convention — this component is its canonical origin
// (see context/design-system.md's "Typography conventions").
const SECTION_HEADING_CLASS =
  "border-b border-dotted border-border pb-1.5 text-[11px] tracking-[0.14em] text-muted-foreground uppercase";

interface ItemDrawerViewProps {
  item: ItemDetailResponse;
  showLanguage: boolean;
  showMarkdown: boolean;
  showOptimize: boolean;
  isImage: boolean;
  isDeleting: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onToggleFavorite: () => void;
  onTogglePin: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAcceptOptimizedPrompt: (content: string) => void;
}

export function ItemDrawerView({
  item,
  showLanguage,
  showMarkdown,
  showOptimize,
  isImage,
  isDeleting,
  onCopy,
  onDownload,
  onToggleFavorite,
  onTogglePin,
  onEdit,
  onDelete,
  onAcceptOptimizedPrompt,
}: ItemDrawerViewProps) {
  const t = useTranslations("drawer");
  return (
    <>
      <div className="flex items-center gap-2">
        {item.fileUrl ? (
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="size-4" />
            {t("download")}
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={onCopy}>
            <Copy className="size-4" />
            {t("copy")}
          </Button>
        )}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onToggleFavorite}
          aria-label={item.isFavorite ? t("unfavorite") : t("favorite")}
        >
          <Star className={item.isFavorite ? "size-4 fill-yellow-400 text-yellow-400" : "size-4"} />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onTogglePin}
          aria-label={item.isPinned ? t("unpin") : t("pin")}
        >
          <Pin className={item.isPinned ? "size-4 fill-current" : "size-4"} />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onEdit}
          disabled={!item.canEdit}
          aria-label={t("editItem")}
          title={item.canEdit ? undefined : t("noPermissionEdit")}
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
        <div className="flex flex-col gap-2.5">
          <h4 className={SECTION_HEADING_CLASS}>
            {t("sectionDescription")}
          </h4>
          <p className="text-sm text-ink-body">{item.description}</p>
        </div>
      )}

      {(item.content || item.url) && (
        <div className="flex flex-col gap-2.5">
          <h4 className={SECTION_HEADING_CLASS}>
            {t("sectionContent")}
          </h4>
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
            <MarkdownEditor
              value={item.content}
              readOnly
              title={item.title}
              isPro={item.isPro}
              showOptimize={showOptimize}
              onAcceptOptimized={onAcceptOptimizedPrompt}
            />
          ) : (
            <pre className="max-h-80 overflow-auto border border-border bg-muted p-3.5 font-mono text-xs leading-[19px] text-ink-body whitespace-pre-wrap">
              {item.content ?? item.url}
            </pre>
          )}
        </div>
      )}

      {item.fileUrl && isImage && (
        <div className="flex flex-col gap-2.5">
          <h4 className={SECTION_HEADING_CLASS}>
            {t("sectionPreview")}
          </h4>
          {/* Fixed-height muted box reserves space so a large image loading in
              doesn't collapse then jump the drawer layout (ui-reviewer finding). */}
          <div className="flex min-h-[200px] items-center justify-center border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.fileUrl}
              alt={item.fileName ?? item.title}
              className="max-h-80 w-full object-contain"
            />
          </div>
        </div>
      )}

      {item.fileName && (
        <div className="flex flex-col gap-2.5">
          <h4 className={SECTION_HEADING_CLASS}>
            {t("sectionFile")}
          </h4>
          <p className="text-sm text-ink-body">
            {item.fileName}
            {item.fileSize != null && ` · ${formatFileSize(item.fileSize)}`}
          </p>
        </div>
      )}

      {item.tags.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h4 className={SECTION_HEADING_CLASS}>
            {t("sectionTags")}
          </h4>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {item.collections.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h4 className={SECTION_HEADING_CLASS}>
            {t("sectionCollections")}
          </h4>
          <div className="flex flex-wrap gap-2">
            {item.collections.map((collection) => (
              <span
                key={collection.id}
                className="flex items-center gap-1.5 border border-rule-strong px-2 py-1 text-[10px] tracking-[0.1em] text-foreground uppercase"
              >
                <span className="size-[7px] bg-primary" />
                {collection.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}