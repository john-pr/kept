"use client";

import { DRAWER_WIDTH_STORAGE_KEY, MIN_DRAWER_WIDTH } from "@/lib/resizable-drawer";
import { useResizableWidth, type ResizableWidth } from "@/hooks/useResizableWidth";

const DRAWER_OPTIONS = { storageKey: DRAWER_WIDTH_STORAGE_KEY, minWidth: MIN_DRAWER_WIDTH };

/**
 * Drag-to-resize width for the right-anchored item drawer — a thin preset over
 * {@link useResizableWidth}. Its single handle sits on the drawer's left edge.
 */
export function useResizableDrawerWidth(enabled: boolean): ResizableWidth {
  return useResizableWidth(enabled, DRAWER_OPTIONS);
}
