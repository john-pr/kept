# Current Feature: Resizable New Item Dialog + Code Editor

## Status

In Progress

## Goals

- Desktop "New item" dialog (`NewItemDialog.tsx`) can be dragged wider/narrower with the mouse, horizontally only
- Drag handle on the left edge only (the right edge carries the form's scrollbar); the centered dialog grows symmetrically and the dragged edge tracks the cursor (width delta = 2 × dx)
- Width clamped to min 448px (current `sm:max-w-md`) and max viewport − 32px; re-clamped when the window shrinks
- Chosen width persists in `localStorage` (`kept:new-item-dialog-width`) across close/reopen
- Handles are keyboard-accessible (`role="separator"`, Arrow keys resize) with a translated aria-label (`itemForm.resizeHandle` in en/pl/fr)
- Monaco/Markdown editors reflow with the new width (Monaco already has `automaticLayout: true`)
- Item drawer resize keeps working identically; mobile Sheet unchanged
- `CodeEditor` (everywhere: New Item, drawer edit form, drawer read view) gets a textarea-style bottom grip to drag its height; auto-fits to content (120–400px) until dragged, then the dragged height sticks (min 120px, max viewport height); ArrowUp/Down resize when focused; not persisted
- `MarkdownEditor` (prompts/notes, same surfaces) gets the same bottom grip — its panels auto-size via CSS (120–400px) until dragged; not persisted

## Notes

- Reuse the item drawer's existing mechanism instead of a second one:
  - `src/lib/resizable-drawer.ts` — add optional `minWidth` to `clampDrawerWidth`/`parseStoredDrawerWidth`, optional `{ min, margin }` to `getMaxDrawerWidth`, plus dialog constants; defaults keep drawer behaviour unchanged
  - `src/hooks/useResizableDrawerWidth.ts` — extract a generic left-edge `useResizableWidth(enabled, { storageKey, minWidth, viewportMargin, symmetric })` into `src/hooks/useResizableWidth.ts`; keep `useResizableDrawerWidth` as a thin wrapper
  - New `src/components/items/ResizeHandle.tsx` extracted from the inline grabber in `ItemDrawer.tsx` (identical markup)
- Code editor: `src/lib/editor-height.ts` (auto/manual clamp helpers + tests), `src/hooks/useResizableHeight.ts`, shared `src/components/items/EditorResizeGrip.tsx` rendered by both `CodeEditor.tsx` and `MarkdownEditor.tsx`. The hook measures the resized element via a ref (`offsetHeight`) at drag start, since the markdown panels size themselves in CSS
- `NewItemDialog.tsx`: apply `style={{ width, maxWidth: "none" }}` on `DialogContent` (same per-value inline-style exception as the drawer). Move `overflow-y-auto` from `DialogContent` onto a body wrapper so the absolutely-positioned handles don't scroll away — header/footer become pinned while the form scrolls (minor side effect, flag in review)
- Performance: mid-drag widths are rAF-throttled and written straight to the surface's inline style via the hook's `surfaceRef` (attached to `DialogContent` / the drawer's `SheetContent`); React state is committed once on release. Cut drag script time ~20× and removed the width lagging behind the pointer. The dialog overlay's `backdrop-blur` is the remaining per-frame paint cost — kept, since the drag is smooth in practice
- Escape mid-drag: the handle unmounts while the hook's owner stays mounted, so `lostpointercapture` fires at the document and React's handler never runs — `watchCaptureLoss` (`src/hooks/watch-capture-loss.ts`) catches it and ends the drag (also fixes the same latent bug in the item drawer). `useResizableHeight` doesn't need it — its grip and hook owner unmount together
- Markdown panels need `flex-none`: `TabsContent`'s default `flex-1` (basis 0%) in the Tabs flex column ignores an explicit `height`, which silently broke dragging in Preview
- Don't edit `src/components/ui/dialog.tsx` — restyle at the call site (design-system rule)
- Out of scope: vertical resize, New/Edit Collection dialogs, drawer edit mode, mobile Sheet
- Tests: extend `src/lib/resizable-drawer.test.ts` for the new params; new `src/lib/editor-height.test.ts`; existing drawer tests must pass unchanged

## History

[//]: # (The full development log now lives in docs/development-log.md — earliest to latest.)
[//]: # (Add each completed feature there, in the format its header prescribes, once merged.)
