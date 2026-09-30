# Current Feature: Unsaved Changes Confirmation

## Status

In Progress

## Goals

- Add a reusable "discard unsaved changes?" confirmation dialog (`src/components/shared/DiscardChangesDialog.tsx` or similar), built on the existing `AlertDialog` primitive and styled per the ledger design system (call-site `className` overrides, no edits to `src/components/ui/*`)
- Add a small reusable hook (e.g. `useConfirmDiscard`) that wraps a dialog's `onOpenChange`: when closing with a dirty form, it intercepts the close and opens the confirmation instead of closing immediately
- Wire it into `NewItemDialog` (both desktop `Dialog` and mobile `Sheet`) and `NewCollectionDialog`
- Also wire it into the edit forms — `EditCollectionDialog` and the item drawer's edit mode (`ItemDrawer`/`ItemDrawerEditForm`: closing the drawer and the Cancel button) — confirming only when the values actually differ from the saved ones
- Every close path is covered: Esc, overlay/outside click, the X close button (desktop + mobile `SheetClose`)
- Confirm → closes the form and resets it (current reset behavior); Cancel → returns to the form with all data intact
- Successful create closes the dialog directly, without a confirmation
- A pristine (untouched) form closes immediately, no confirmation
- Copy is translated in `src/messages/en.json`, `pl.json`, `fr.json`

## Notes

- "Dirty" = form differs from its initial state (for `NewItemDialog`: the initial form incl. preselected `defaultCollectionIds`, plus the item type if it changed from `initialTypeId`; an uploaded file counts as dirty). Whitespace-only input counts as pristine.
- Dirty-check comparison logic is a pure function → lives in `src/lib/` with a unit test (`*.test.ts` next to it), per coding standards.
- Existing pattern to follow: `DeleteItemDialog.tsx` (`AlertDialog` + `useTranslations`, `common.cancel`).
- Out of scope: browser `beforeunload` on tab close/refresh.
- No mockup — extrapolate from `context/design-system.md` (dialog title `tracking-[0.12em] uppercase`, footer `border-t bg-muted/40`, destructive action for "Discard").

## History

[//]: # (The full development log now lives in docs/development-log.md — earliest to latest.)
[//]: # (Add each completed feature there, in the format its header prescribes, once merged.)
