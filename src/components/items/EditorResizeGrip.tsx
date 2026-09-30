"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { ResizeHandleProps } from "@/hooks/useResizableWidth";
import { MAX_MANUAL_EDITOR_HEIGHT, MIN_EDITOR_HEIGHT } from "@/lib/editor-height";

interface EditorResizeGripProps {
  /** Currently rendered editor-body height, for `aria-valuenow`. */
  height: number;
  isResizing: boolean;
  handleProps: ResizeHandleProps;
  /** Background matching the editor's own header bar. */
  className?: string;
}

/** Textarea-style bottom grip for `CodeEditor` / `MarkdownEditor`, driven by `useResizableHeight`. */
export function EditorResizeGrip({ height, isResizing, handleProps, className }: EditorResizeGripProps) {
  const t = useTranslations("editor");

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      aria-label={t("resizeEditor")}
      aria-valuemin={MIN_EDITOR_HEIGHT}
      aria-valuemax={MAX_MANUAL_EDITOR_HEIGHT}
      aria-valuenow={height}
      tabIndex={0}
      {...handleProps}
      data-resizing={isResizing ? "" : undefined}
      className={cn(
        "group flex h-3 shrink-0 cursor-row-resize touch-none items-center justify-center border-t border-border/50 outline-none",
        className
      )}
    >
      {/* grabber bar — grows and turns accent green on hover / focus / drag */}
      <span
        aria-hidden
        className="h-0.5 w-8 bg-neutral-600 transition-[width,background-color] duration-150 group-hover:w-12 group-hover:bg-primary group-focus-visible:w-12 group-focus-visible:bg-primary group-data-[resizing]:w-12 group-data-[resizing]:bg-primary"
      />
    </div>
  );
}
