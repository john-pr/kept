"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import {
  DRAWER_WIDTH_STORAGE_KEY,
  MIN_DRAWER_WIDTH,
  clampDrawerWidth,
  getMaxDrawerWidth,
  parseStoredDrawerWidth,
} from "@/lib/resizable-drawer";

/** Pixels per Arrow-key press when the drag handle is focused. */
const KEYBOARD_STEP = 32;

interface DrawerResizeHandleProps {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onLostPointerCapture: (event: ReactPointerEvent<HTMLElement>) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
}

interface ResizableDrawerWidth {
  /** Inline width (px) for the drawer, or `null` to defer to its default CSS width — on the
   *  server, or on viewports where resizing is disabled. */
  width: number | null;
  minWidth: number;
  maxWidth: number;
  isResizing: boolean;
  /** Spread onto the drag-handle element. */
  handleProps: DrawerResizeHandleProps;
}

function readStoredWidth(): number | null {
  if (typeof window === "undefined") return null;
  const max = getMaxDrawerWidth(window.innerWidth);
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(DRAWER_WIDTH_STORAGE_KEY);
  } catch {
    stored = null;
  }
  return parseStoredDrawerWidth(stored, max) ?? MIN_DRAWER_WIDTH;
}

function clearBodyDragStyles() {
  document.body.style.removeProperty("user-select");
  document.body.style.removeProperty("cursor");
}

/**
 * Drag-to-resize width for the right-anchored item drawer. The handle owns the move/up
 * listeners via `setPointerCapture` (no window listeners), width writes are rAF-throttled,
 * and the last value is persisted to `localStorage`. Pass `enabled: false` (mobile) and
 * `width` reports `null` so the drawer keeps its CSS width.
 *
 * Initial width is read from `localStorage` in a lazy `useState` initializer rather than an
 * effect — the drawer subtree is never server-rendered (the Sheet portal only mounts when
 * open), so there's no hydration mismatch, and this avoids a `set-state-in-effect` pass.
 */
export function useResizableDrawerWidth(enabled: boolean): ResizableDrawerWidth {
  const [width, setWidth] = useState<number | null>(readStoredWidth);
  const [maxWidth, setMaxWidth] = useState(() =>
    getMaxDrawerWidth(typeof window === "undefined" ? undefined : window.innerWidth)
  );
  const [isResizing, setIsResizing] = useState(false);

  const dragStart = useRef<{ x: number; width: number; max: number } | null>(null);
  const pendingWidth = useRef<number | null>(null);
  const frame = useRef<number | null>(null);

  const persist = useCallback((value: number) => {
    try {
      window.localStorage.setItem(DRAWER_WIDTH_STORAGE_KEY, String(value));
    } catch {
      /* storage unavailable (private mode etc.) — resizing still works for the session */
    }
  }, []);

  // Keep `maxWidth` following the viewport for the component's whole life, so `aria-valuemax`
  // stays correct even across the mobile/desktop breakpoint. setState only fires from the
  // event handler, never synchronously during the effect.
  useEffect(() => {
    function syncMax() {
      setMaxWidth(getMaxDrawerWidth(window.innerWidth));
    }
    window.addEventListener("resize", syncMax);
    return () => window.removeEventListener("resize", syncMax);
  }, []);

  // While resizing is enabled, shrink the chosen width back in if the window got narrower.
  useEffect(() => {
    if (!enabled) return;
    function clampToViewport() {
      setWidth((current) =>
        current == null ? current : clampDrawerWidth(current, getMaxDrawerWidth(window.innerWidth))
      );
    }
    window.addEventListener("resize", clampToViewport);
    return () => window.removeEventListener("resize", clampToViewport);
  }, [enabled]);

  // Safety net: drop body styles / pending frame if we unmount mid-drag.
  useEffect(() => {
    return () => {
      if (frame.current != null) cancelAnimationFrame(frame.current);
      clearBodyDragStyles();
    };
  }, []);

  const flush = useCallback(() => {
    frame.current = null;
    if (pendingWidth.current != null) setWidth(pendingWidth.current);
  }, []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled || event.button !== 0) return;
      const max = getMaxDrawerWidth(window.innerWidth);
      dragStart.current = { x: event.clientX, width: width ?? MIN_DRAWER_WIDTH, max };
      setMaxWidth(max);
      setIsResizing(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
      event.preventDefault();
    },
    [enabled, width]
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const start = dragStart.current;
      if (!start) return;
      // Right-anchored drawer: dragging the handle left (clientX decreases) widens it.
      pendingWidth.current = clampDrawerWidth(start.width + (start.x - event.clientX), start.max);
      frame.current ??= requestAnimationFrame(flush);
    },
    [flush]
  );

  const endResize = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!dragStart.current) return;
      dragStart.current = null;
      if (frame.current != null) {
        cancelAnimationFrame(frame.current);
        frame.current = null;
      }
      const settled = pendingWidth.current;
      pendingWidth.current = null;
      setIsResizing(false);
      clearBodyDragStyles();
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setWidth((current) => {
        const next = settled ?? current;
        if (next != null) persist(next);
        return next;
      });
    },
    [persist]
  );

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      if (!enabled) return;
      const delta =
        event.key === "ArrowLeft"
          ? KEYBOARD_STEP
          : event.key === "ArrowRight"
            ? -KEYBOARD_STEP
            : 0;
      if (delta === 0) return;
      event.preventDefault();
      const max = getMaxDrawerWidth(window.innerWidth);
      setMaxWidth(max);
      setWidth((current) => {
        const next = clampDrawerWidth((current ?? MIN_DRAWER_WIDTH) + delta, max);
        persist(next);
        return next;
      });
    },
    [enabled, persist]
  );

  return {
    width: enabled ? width : null,
    minWidth: MIN_DRAWER_WIDTH,
    maxWidth,
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
