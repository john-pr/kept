"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { MIN_EDITOR_HEIGHT, clampManualEditorHeight } from "@/lib/editor-height";
import type { ResizeHandleProps } from "@/hooks/useResizableWidth";

/** Pixels per ArrowUp/ArrowDown press when the grip is focused. */
const KEYBOARD_STEP = 32;

interface ResizableHeight {
  /** Height the user dragged to, or `null` while the caller's own (auto) height applies. */
  manualHeight: number | null;
  isResizing: boolean;
  /** Spread onto the bottom drag grip. */
  handleProps: ResizeHandleProps;
}

/** Rendered height of the resized element — `offsetHeight`, so an in-flight open/zoom
 *  transform on a surrounding dialog doesn't skew it. */
function measure(getTarget: () => HTMLElement | null): number {
  return getTarget()?.offsetHeight ?? MIN_EDITOR_HEIGHT;
}

function clearBodyDragStyles() {
  document.body.style.removeProperty("user-select");
  document.body.style.removeProperty("cursor");
}

/**
 * Textarea-style drag-to-resize height via a bottom grip — dragging down grows it. Starts in
 * "auto" mode (`manualHeight: null`) so the caller keeps sizing itself (in JS or CSS); the
 * drag starts from the element's measured height, and the first drag or
 * Arrow-key press switches to a fixed, user-chosen height. Same pointer-capture + rAF
 * pattern as `useResizableWidth`. Not persisted — each editor instance resizes on its own.
 *
 * @param getTarget Returns the element whose height is being resized (measured when a resize
 *   starts) — a getter rather than a ref so callers with several swappable elements (e.g.
 *   tab panels) can pick the active one.
 */
export function useResizableHeight(getTarget: () => HTMLElement | null): ResizableHeight {
  const [manualHeight, setManualHeight] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  const dragStart = useRef<{ y: number; height: number } | null>(null);
  const pendingHeight = useRef<number | null>(null);
  const frame = useRef<number | null>(null);

  // Safety net: drop body styles / pending frame if we unmount mid-drag.
  useEffect(() => {
    return () => {
      if (frame.current != null) cancelAnimationFrame(frame.current);
      clearBodyDragStyles();
    };
  }, []);

  const flush = useCallback(() => {
    frame.current = null;
    if (pendingHeight.current != null) setManualHeight(pendingHeight.current);
  }, []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.button !== 0) return;
      dragStart.current = { y: event.clientY, height: measure(getTarget) };
      setIsResizing(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "row-resize";
      event.preventDefault();
    },
    [getTarget]
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const start = dragStart.current;
      if (!start) return;
      pendingHeight.current = clampManualEditorHeight(
        start.height + (event.clientY - start.y),
        window.innerHeight
      );
      frame.current ??= requestAnimationFrame(flush);
    },
    [flush]
  );

  const endResize = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (!dragStart.current) return;
    dragStart.current = null;
    if (frame.current != null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    const settled = pendingHeight.current;
    pendingHeight.current = null;
    setIsResizing(false);
    clearBodyDragStyles();
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (settled != null) setManualHeight(settled);
  }, []);

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      const delta =
        event.key === "ArrowDown" ? KEYBOARD_STEP : event.key === "ArrowUp" ? -KEYBOARD_STEP : 0;
      if (delta === 0) return;
      event.preventDefault();
      setManualHeight(clampManualEditorHeight(measure(getTarget) + delta, window.innerHeight));
    },
    [getTarget]
  );

  return {
    manualHeight,
    isResizing,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endResize,
      onLostPointerCapture: endResize,
      onKeyDown,
    },
  };
}
