export const FREE_ITEM_LIMIT = 5;
export const FREE_COLLECTION_LIMIT = 1;
export const FREE_GATED_TYPE_NAMES = new Set(["file", "image"]);

export function isOverItemLimit(currentCount: number, isPro: boolean): boolean {
  return !isPro && currentCount >= FREE_ITEM_LIMIT;
}

export function isOverCollectionLimit(currentCount: number, isPro: boolean): boolean {
  return !isPro && currentCount >= FREE_COLLECTION_LIMIT;
}

export function isProOnlyType(typeName: string): boolean {
  return FREE_GATED_TYPE_NAMES.has(typeName.toLowerCase());
}

/** Feature flag gating enforcement of the above limits. Defaults to off — see project-overview.md §6. */
export function isPlanGatingEnabled(): boolean {
  return process.env.PLAN_GATING_ENABLED === "true";
}

/** Whether a non-Pro user should be blocked from an AI action, per the plan-gating flag. */
export function isAiProGated(isPro: boolean): boolean {
  return isPlanGatingEnabled() && !isPro;
}
