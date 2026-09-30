/**
 * Pure helpers for `CodeEditor`'s height — auto-fit to content within a range, or a manual
 * height the user drags (textarea-style). Kept in `src/lib` so Vitest covers them.
 */

/** Smallest height the editor body ever renders at, in px. */
export const MIN_EDITOR_HEIGHT = 120;

/** Auto-fit stops growing past this; the user can still drag the editor taller. */
export const MAX_AUTO_EDITOR_HEIGHT = 400;

/** Fallback cap for a dragged height before the viewport height is known. */
export const MAX_MANUAL_EDITOR_HEIGHT = 1200;

/** Height that fits `contentHeight`, clamped to `[MIN_EDITOR_HEIGHT, MAX_AUTO_EDITOR_HEIGHT]`. */
export function getAutoEditorHeight(contentHeight: number): number {
  if (!Number.isFinite(contentHeight)) return MIN_EDITOR_HEIGHT;
  return Math.min(MAX_AUTO_EDITOR_HEIGHT, Math.max(MIN_EDITOR_HEIGHT, Math.round(contentHeight)));
}

/**
 * Clamps a dragged height to `[MIN_EDITOR_HEIGHT, maxHeight]` (rounded to whole px). `maxHeight`
 * is typically the viewport height, so the editor can't be dragged taller than the screen.
 */
export function clampManualEditorHeight(
  height: number,
  maxHeight: number = MAX_MANUAL_EDITOR_HEIGHT
): number {
  const upper = Math.max(MIN_EDITOR_HEIGHT, Number.isFinite(maxHeight) ? maxHeight : MAX_MANUAL_EDITOR_HEIGHT);
  if (!Number.isFinite(height)) return MIN_EDITOR_HEIGHT;
  return Math.min(upper, Math.max(MIN_EDITOR_HEIGHT, Math.round(height)));
}
