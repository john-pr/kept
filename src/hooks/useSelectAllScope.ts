import { useCallback, type KeyboardEvent } from "react";

/**
 * Scopes Ctrl+A / Cmd+A to a read-only content block (markdown preview,
 * plain `<pre>`), so clicking inside it and pressing the shortcut selects
 * only its contents instead of the whole page. Spread the returned props
 * onto the element — `tabIndex` makes a plain div focusable by click so it
 * can receive the key event.
 */
export function useSelectAllScope() {
  const onKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (event.key.toLowerCase() !== "a" || !(event.ctrlKey || event.metaKey)) return;
    if (event.shiftKey || event.altKey) return;

    event.preventDefault();
    const selection = window.getSelection();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(event.currentTarget);
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  return { tabIndex: 0, onKeyDown };
}
