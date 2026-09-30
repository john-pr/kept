/**
 * Pure helpers for drag-to-resize surfaces — the item drawer (`useResizableDrawerWidth` +
 * `ItemDrawer`) and the New Item dialog (`useResizableWidth` + `NewItemDialog`). Kept
 * dependency-free and in `src/lib` so the clamp/parse logic is covered by the Vitest include
 * globs (hooks aren't).
 */

/** The drawer's original fixed width (`sm:max-w-[28rem]`) — also the minimum it can shrink to. */
export const MIN_DRAWER_WIDTH = 448;

/** Fallback upper bound, used only before the viewport width is known (e.g. pre-mount). */
export const MAX_DRAWER_WIDTH = 960;

/** Fraction of the viewport the drawer may occupy at most — full-width, so it can be dragged
 *  right up to the screen edge. */
export const MAX_DRAWER_VIEWPORT_FRACTION = 1;

/** `localStorage` key holding the last chosen width, in px. */
export const DRAWER_WIDTH_STORAGE_KEY = "kept:item-drawer-width";

/** The New Item dialog's original fixed width (`sm:max-w-md`) — also its minimum. */
export const MIN_ITEM_DIALOG_WIDTH = 448;

/** Gap kept free around the centered dialog, matching the primitive's `max-w-[calc(100%-2rem)]`. */
export const ITEM_DIALOG_VIEWPORT_MARGIN = 32;

/** `localStorage` key holding the New Item dialog's last chosen width, in px. */
export const ITEM_DIALOG_WIDTH_STORAGE_KEY = "kept:new-item-dialog-width";

interface MaxWidthOptions {
  /** Lower bound for the result (defaults to {@link MIN_DRAWER_WIDTH}). */
  min?: number;
  /** Total px subtracted from the viewport width (defaults to 0). */
  margin?: number;
}

/**
 * Largest width the surface may take for a given viewport: the viewport width minus `margin`
 * (no hard cap), never less than `min`. Falls back to {@link MAX_DRAWER_WIDTH} when no
 * viewport width is known (e.g. before mount).
 */
export function getMaxDrawerWidth(
  viewportWidth?: number,
  { min = MIN_DRAWER_WIDTH, margin = 0 }: MaxWidthOptions = {}
): number {
  if (!viewportWidth || !Number.isFinite(viewportWidth) || viewportWidth <= 0) {
    return Math.max(min, MAX_DRAWER_WIDTH);
  }
  const fraction = Math.round(viewportWidth * MAX_DRAWER_VIEWPORT_FRACTION) - margin;
  return Math.max(min, fraction);
}

/** Clamps `width` to `[minWidth, maxWidth]` and rounds to a whole px. */
export function clampDrawerWidth(
  width: number,
  maxWidth: number = MAX_DRAWER_WIDTH,
  minWidth: number = MIN_DRAWER_WIDTH
): number {
  const upper = Math.max(minWidth, maxWidth);
  if (!Number.isFinite(width)) return minWidth;
  return Math.min(upper, Math.max(minWidth, Math.round(width)));
}

/**
 * Parses a persisted width string into a usable, clamped px value, or `null` when it's
 * absent / unparseable / non-positive so the caller can fall back to the default width.
 */
export function parseStoredDrawerWidth(
  raw: string | null,
  maxWidth: number = MAX_DRAWER_WIDTH,
  minWidth: number = MIN_DRAWER_WIDTH
): number | null {
  if (raw == null) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return clampDrawerWidth(parsed, maxWidth, minWidth);
}
