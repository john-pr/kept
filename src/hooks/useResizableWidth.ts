"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
} from "react";
import { clampDrawerWidth, getMaxDrawerWidth, parseStoredDrawerWidth } from "@/lib/resizable-drawer";
import { watchCaptureLoss } from "@/hooks/watch-capture-loss";

/** Pixels per Arrow-key press when a drag handle is focused. */
const KEYBOARD_STEP = 32;

export interface ResizeHandleProps {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onLostPointerCapture: (event: ReactPointerEvent<HTMLElement>) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => void;
}

export interface ResizableWidthOptions {
  /** `localStorage` key the last chosen width is persisted under. */
  storageKey: string;
  /** Default and minimum width, in px. */
  minWidth: number;
  /** Total px kept free between the surface and the viewport edges (default 0). */
  viewportMargin?: number;
  /** `true` for a horizontally centered surface that grows on both sides — the pointer delta
   *  is doubled so the dragged edge keeps tracking the cursor. */
  symmetric?: boolean;
}

export interface ResizableWidth {
  /** Inline width (px) for the surface, or `null` to defer to its default CSS width — on the
   *  server, or on viewports where resizing is disabled. */
  width: number | null;
  minWidth: number;
  maxWidth: number;
  isResizing: boolean;
  /** Attach to the resized element — mid-drag widths are written straight to its style. */
  surfaceRef: RefObject<HTMLDivElement | null>;
  /** Spread onto the drag handle, which sits on the surface's left edge. */
  handleProps: ResizeHandleProps;
}

function readStoredWidth(storageKey: string, minWidth: number, viewportMargin: number): number | null {
  if (typeof window === "undefined") return null;
  const max = getMaxDrawerWidth(window.innerWidth, { min: minWidth, margin: viewportMargin });
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(storageKey);
  } catch {
    stored = null;
  }
  return parseStoredDrawerWidth(stored, max, minWidth) ?? minWidth;
}

function clearBodyDragStyles() {
  document.body.style.removeProperty("user-select");
  document.body.style.removeProperty("cursor");
}

/**
 * Drag-to-resize width for a panel (item drawer, New Item dialog) via a handle on its left
 * edge — dragging left widens it. The handle owns the
 * move/up listeners via `setPointerCapture` (no window listeners). Mid-drag widths are
 * rAF-throttled and written directly to `surfaceRef`'s inline style (plus the handle's
 * `aria-valuenow`) instead of React state, so the surface's subtree doesn't re-render every
 * frame; state is committed once on release and the value persisted to `localStorage`. Pass `enabled: false`
 * (mobile) and `width` reports `null` so the surface keeps its CSS width.
 *
 * Initial width is read from `localStorage` in a lazy `useState` initializer rather than an
 * effect — both surfaces render inside portals that only mount when open, so there's no
 * hydration mismatch, and this avoids a `set-state-in-effect` pass.
 */
export function useResizableWidth(
  enabled: boolean,
  { storageKey, minWidth, viewportMargin = 0, symmetric = false }: ResizableWidthOptions
): ResizableWidth {
  const computeMax = useCallback(
    (viewportWidth?: number) => getMaxDrawerWidth(viewportWidth, { min: minWidth, margin: viewportMargin }),
    [minWidth, viewportMargin]
  );

  const [width, setWidth] = useState<number | null>(() =>
    readStoredWidth(storageKey, minWidth, viewportMargin)
  );
  const [maxWidth, setMaxWidth] = useState(() =>
    computeMax(typeof window === "undefined" ? undefined : window.innerWidth)
  );
  const [isResizing, setIsResizing] = useState(false);

  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef<{ x: number; width: number; max: number; handle: HTMLElement } | null>(
    null
  );
  const stopWatchingCapture = useRef<(() => void) | null>(null);
  const pendingWidth = useRef<number | null>(null);
  const frame = useRef<number | null>(null);

  const persist = useCallback(
    (value: number) => {
      try {
        window.localStorage.setItem(storageKey, String(value));
      } catch {
        /* storage unavailable (private mode etc.) — resizing still works for the session */
      }
    },
    [storageKey]
  );

  // Keep `maxWidth` following the viewport for the component's whole life, so `aria-valuemax`
  // stays correct even across the mobile/desktop breakpoint. setState only fires from the
  // event handler, never synchronously during the effect.
  useEffect(() => {
    function syncMax() {
      setMaxWidth(computeMax(window.innerWidth));
    }
    window.addEventListener("resize", syncMax);
    return () => window.removeEventListener("resize", syncMax);
  }, [computeMax]);

  // While resizing is enabled, shrink the chosen width back in if the window got narrower.
  useEffect(() => {
    if (!enabled) return;
    function clampToViewport() {
      setWidth((current) =>
        current == null ? current : clampDrawerWidth(current, computeMax(window.innerWidth), minWidth)
      );
    }
    window.addEventListener("resize", clampToViewport);
    return () => window.removeEventListener("resize", clampToViewport);
  }, [enabled, computeMax, minWidth]);

  // Safety net: drop body styles / pending frame / capture watcher if we unmount mid-drag.
  useEffect(() => {
    return () => {
      if (frame.current != null) cancelAnimationFrame(frame.current);
      stopWatchingCapture.current?.();
      clearBodyDragStyles();
    };
  }, []);

  // Mirrors what React renders for `width` (`style={{ width, maxWidth: "none" }}`), so the
  // commit on release is a no-op for the DOM.
  const applyToDom = useCallback((value: number) => {
    const surface = surfaceRef.current;
    if (surface) {
      surface.style.width = `${value}px`;
      surface.style.maxWidth = "none";
    }
    dragStart.current?.handle.setAttribute("aria-valuenow", String(value));
  }, []);

  const flush = useCallback(() => {
    frame.current = null;
    if (pendingWidth.current != null) applyToDom(pendingWidth.current);
  }, [applyToDom]);

  const finishResize = useCallback(() => {
    if (!dragStart.current) return;
    stopWatchingCapture.current?.();
    stopWatchingCapture.current = null;
    if (frame.current != null) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
    }
    const settled = pendingWidth.current;
    pendingWidth.current = null;
    // Land the final value even if its frame was cancelled — React skips the DOM write when
    // `settled` equals the pre-drag width, so the DOM must already be correct.
    if (settled != null) applyToDom(settled);
    dragStart.current = null;
    setIsResizing(false);
    clearBodyDragStyles();
    setWidth((current) => {
      const next = settled ?? current;
      if (next != null) persist(next);
      return next;
    });
  }, [persist, applyToDom]);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled || event.button !== 0) return;
      const max = computeMax(window.innerWidth);
      dragStart.current = {
        x: event.clientX,
        width: width ?? minWidth,
        max,
        handle: event.currentTarget,
      };
      setMaxWidth(max);
      setIsResizing(true);
      event.currentTarget.setPointerCapture(event.pointerId);
      stopWatchingCapture.current = watchCaptureLoss(event.pointerId, finishResize);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
      event.preventDefault();
    },
    [enabled, width, minWidth, computeMax, finishResize]
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const start = dragStart.current;
      if (!start) return;
      // Left-edge handle: dragging left (clientX decreases) widens.
      const delta = (start.x - event.clientX) * (symmetric ? 2 : 1);
      pendingWidth.current = clampDrawerWidth(start.width + delta, start.max, minWidth);
      frame.current ??= requestAnimationFrame(flush);
    },
    [flush, symmetric, minWidth]
  );

  const endResize = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      finishResize();
    },
    [finishResize]
  );

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLElement>) => {
      if (!enabled) return;
      const delta =
        event.key === "ArrowLeft" ? KEYBOARD_STEP : event.key === "ArrowRight" ? -KEYBOARD_STEP : 0;
      if (delta === 0) return;
      event.preventDefault();
      const max = computeMax(window.innerWidth);
      setMaxWidth(max);
      setWidth((current) => {
        const next = clampDrawerWidth((current ?? minWidth) + delta, max, minWidth);
        persist(next);
        return next;
      });
    },
    [enabled, persist, computeMax, minWidth]
  );

  return {
    width: enabled ? width : null,
    minWidth,
    maxWidth,
    isResizing,
    surfaceRef,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endResize,
      onLostPointerCapture: endResize,
      onKeyDown,
    },
  };
}
