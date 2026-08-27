/**
 * Pure helpers for the drag-to-resize item drawer (`useResizableDrawerWidth` +
 * `ItemDrawer`). Kept dependency-free and in `src/lib` so the clamp/parse logic is
 * covered by the Vitest include globs (hooks aren't).
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

/**
 * Largest width the drawer may take for a given viewport: up to the full viewport width
 * (no hard cap), never less than {@link MIN_DRAWER_WIDTH}. Falls back to
 * {@link MAX_DRAWER_WIDTH} when no viewport width is known (e.g. before mount).
 */
export function getMaxDrawerWidth(viewportWidth?: number): number {
  if (!viewportWidth || !Number.isFinite(viewportWidth) || viewportWidth <= 0) {
    return MAX_DRAWER_WIDTH;
  }
  const fraction = Math.round(viewportWidth * MAX_DRAWER_VIEWPORT_FRACTION);
  return Math.max(MIN_DRAWER_WIDTH, fraction);
}

/** Clamps `width` to `[MIN_DRAWER_WIDTH, maxWidth]` and rounds to a whole px. */
export function clampDrawerWidth(width: number, maxWidth: number = MAX_DRAWER_WIDTH): number {
  const upper = Math.max(MIN_DRAWER_WIDTH, maxWidth);
  if (!Number.isFinite(width)) return MIN_DRAWER_WIDTH;
  return Math.min(upper, Math.max(MIN_DRAWER_WIDTH, Math.round(width)));
}

/**
 * Parses a persisted width string into a usable, clamped px value, or `null` when it's
 * absent / unparseable / non-positive so the caller can fall back to the default width.
 */
export function parseStoredDrawerWidth(
  raw: string | null,
  maxWidth: number = MAX_DRAWER_WIDTH
): number | null {
  if (raw == null) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return clampDrawerWidth(parsed, maxWidth);
}
