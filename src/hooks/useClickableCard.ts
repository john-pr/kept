import { useCallback, type KeyboardEvent } from "react";

/**
 * Shared interaction handlers for a div-based card that opens an item on
 * click or on Enter/Space (mirroring native button semantics). Spread the
 * returned props onto the card element along with `role="button"` and
 * `tabIndex={0}`.
 */
export function useClickableCard(onOpen: () => void) {
  const onClick = useCallback(() => {
    onOpen();
  }, [onOpen]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onOpen();
      }
    },
    [onOpen]
  );

  return { onClick, onKeyDown };
}