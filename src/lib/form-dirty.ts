function isSameValue(initial: unknown, current: unknown): boolean {
  if (typeof initial === "string" && typeof current === "string") {
    return initial.trim() === current.trim();
  }

  if (Array.isArray(initial) && Array.isArray(current)) {
    if (initial.length !== current.length) return false;
    const initialSet = new Set(initial);
    return current.every((value) => initialSet.has(value));
  }

  return initial === current;
}

/**
 * Whether a form's current values differ from the ones it opened with. Strings are
 * compared trimmed (whitespace-only edits don't count), arrays as unordered sets
 * (e.g. selected collection ids), everything else by strict equality.
 */
export function isFormDirty<T extends object>(initial: T, current: T): boolean {
  return (Object.keys(initial) as (keyof T)[]).some(
    (key) => !isSameValue(initial[key], current[key]),
  );
}
