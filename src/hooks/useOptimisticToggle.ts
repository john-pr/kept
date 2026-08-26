import { useState } from "react";
import { toast } from "@/lib/toast";

type ToggleAction = (next: boolean) => Promise<{ success: boolean; error?: string }>;

/**
 * Flips `value` optimistically via `setValue`, persists it via `toggleAction`,
 * and reverts (toasting an error) if the action fails. Not a hook itself —
 * for callers whose boolean lives inside a larger piece of state (e.g. a
 * nested field of an `item` object) rather than an owned local boolean, so
 * they can't use `useOptimisticToggle`'s own internal `useState` directly.
 * `onSuccess` runs only when the toggle succeeds (e.g. a distinct success toast).
 */
export async function toggleOptimisticField(
  value: boolean,
  setValue: (next: boolean) => void,
  toggleAction: ToggleAction,
  errorMessage: string,
  onSuccess?: (next: boolean) => void
): Promise<void> {
  const next = !value;
  setValue(next);
  const result = await toggleAction(next);
  if (!result.success) {
    setValue(!next);
    toast.error(result.error ?? errorMessage);
  } else {
    onSuccess?.(next);
  }
}

/**
 * Owns a boolean piece of state that's flipped optimistically and persisted
 * via a server action, reverting (and toasting an error) if the action
 * fails. Returns a `[value, toggle]` tuple, mirroring `useState`'s shape.
 */
export function useOptimisticToggle(
  initialValue: boolean,
  toggleAction: ToggleAction,
  errorMessage: string,
  onSuccess?: (next: boolean) => void
): [boolean, () => Promise<void>] {
  const [value, setValue] = useState(initialValue);

  return [
    value,
    () => toggleOptimisticField(value, setValue, toggleAction, errorMessage, onSuccess),
  ];
}
