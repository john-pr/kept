"use client";

import type { ResizeHandleProps as HandleEventProps } from "@/hooks/useResizableWidth";

interface ResizeHandleProps {
  label: string;
  minWidth: number;
  maxWidth: number;
  width: number;
  isResizing: boolean;
  handleProps: HandleEventProps;
}

/** Full-height, keyboard-focusable left-edge drag handle for `useResizableWidth` surfaces. */
export function ResizeHandle({
  label,
  minWidth,
  maxWidth,
  width,
  isResizing,
  handleProps,
}: ResizeHandleProps) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      aria-valuenow={width}
      tabIndex={0}
      {...handleProps}
      data-resizing={isResizing ? "" : undefined}
      className="group absolute inset-y-0 left-0 z-20 flex w-4 cursor-col-resize touch-none items-center justify-center outline-none"
    >
      {/* full-height accent line — always visibly green so the edge reads as draggable */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-0.5 bg-primary/40 transition-colors group-hover:bg-primary group-focus-visible:bg-primary group-data-[resizing]:bg-primary"
      />
      {/* centered grabber bar — grows and brightens on hover / focus / drag */}
      <span
        aria-hidden
        className="relative h-14 w-1 bg-primary/70 transition-[height,width,background-color] duration-150 group-hover:h-20 group-hover:w-1.5 group-hover:bg-primary group-focus-visible:h-20 group-focus-visible:w-1.5 group-focus-visible:bg-primary group-data-[resizing]:h-20 group-data-[resizing]:w-1.5 group-data-[resizing]:bg-primary"
      />
    </div>
  );
}
