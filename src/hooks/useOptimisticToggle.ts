import { useState } from "react";
import { toast } from "sonner";

/**
 * Owns a boolean piece of state that's flipped optimistically and persisted
 * via a server action, reverting (and toasting an error) if the action
 * fails. Returns a `[value, toggle]` tuple, mirroring `useState`'s shape.
 */
export function useOptimisticToggle(
  initialValue: boolean,
  toggleAction: (next: boolean) => Promise<{ success: boolean; error?: string }>,
  errorMessage: string
): [boolean, () => Promise<void>] {
  const [value, setValue] = useState(initialValue);

  async function toggle() {
    const next = !value;
    setValue(next);
    const result = await toggleAction(next);
    if (!result.success) {
      setValue(!next);
      toast.error(result.error ?? errorMessage);
    }
  }

  return [value, toggle];
}
