# Current Feature

## Status

In progress — `feature/scoped-select-all`

## Goals

- Clicking inside a read-only content view (markdown preview, AI explanation panel, plain `<pre>` content in the item drawer) and pressing Ctrl+A / Cmd+A selects only that block's content, not the whole page.
- Shared `src/hooks/useSelectAllScope.ts` hook: makes the element focusable (`tabIndex={0}`) and scopes Ctrl/Cmd+A to it via `Range.selectNodeContents`.
- Apply to `MarkdownEditor` preview panel, `CodeEditor` explanation panel, and the `<pre>` fallback in `ItemDrawerView`.

## Notes

- Monaco (`CodeEditor` code tab) and `Textarea` (write tab) already scope Ctrl+A natively — no change needed.
- No unit test: the hook is DOM-only and the project has no jsdom setup (tests cover actions/lib only).

## History

[//]: # (The full development log now lives in docs/development-log.md — earliest to latest.)
[//]: # (Add each completed feature there, in the format its header prescribes, once merged.)
