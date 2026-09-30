import { useState } from "react";

/**
 * Gates a "close/cancel the form" action behind the discard-changes confirmation.
 * `guard(action)` runs `action` right away when the form is pristine; when it's dirty it
 * parks the action and opens the confirmation, running it only on confirm.
 * Spread `dialogProps` onto `<DiscardChangesDialog>`.
 */
export function useDiscardGuard(isDirty: boolean) {
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  function guard(action: () => void) {
    if (isDirty) {
      setPendingAction(() => action);
    } else {
      action();
    }
  }

  const dialogProps = {
    open: pendingAction !== null,
    onCancel: () => setPendingAction(null),
    onConfirm: () => {
      const action = pendingAction;
      setPendingAction(null);
      action?.();
    },
  };

  return { guard, dialogProps };
}
