import { afterEach, describe, expect, it } from "vitest";
import {
  FREE_COLLECTION_LIMIT,
  FREE_ITEM_LIMIT,
  isOverCollectionLimit,
  isOverItemLimit,
  isPlanGatingEnabled,
  isProOnlyType,
} from "./plan-limits";

describe("isOverItemLimit", () => {
  it("returns false for a Pro user regardless of count", () => {
    expect(isOverItemLimit(FREE_ITEM_LIMIT + 100, true)).toBe(false);
  });

  it("returns false for a free user under the limit", () => {
    expect(isOverItemLimit(FREE_ITEM_LIMIT - 1, false)).toBe(false);
  });

  it("returns true for a free user at the limit", () => {
    expect(isOverItemLimit(FREE_ITEM_LIMIT, false)).toBe(true);
  });

  it("returns true for a free user over the limit", () => {
    expect(isOverItemLimit(FREE_ITEM_LIMIT + 1, false)).toBe(true);
  });
});

describe("isOverCollectionLimit", () => {
  it("returns false for a Pro user regardless of count", () => {
    expect(isOverCollectionLimit(FREE_COLLECTION_LIMIT + 10, true)).toBe(false);
  });

  it("returns false for a free user under the limit", () => {
    expect(isOverCollectionLimit(FREE_COLLECTION_LIMIT - 1, false)).toBe(false);
  });

  it("returns true for a free user at the limit", () => {
    expect(isOverCollectionLimit(FREE_COLLECTION_LIMIT, false)).toBe(true);
  });
});

describe("isProOnlyType", () => {
  it("returns true for file and image, case-insensitively", () => {
    expect(isProOnlyType("file")).toBe(true);
    expect(isProOnlyType("Image")).toBe(true);
    expect(isProOnlyType("FILE")).toBe(true);
  });

  it("returns false for other type names", () => {
    expect(isProOnlyType("snippet")).toBe(false);
    expect(isProOnlyType("Link")).toBe(false);
  });
});

describe("isPlanGatingEnabled", () => {
  const originalValue = process.env.PLAN_GATING_ENABLED;

  afterEach(() => {
    process.env.PLAN_GATING_ENABLED = originalValue;
  });

  it("defaults to disabled when the env var is unset", () => {
    delete process.env.PLAN_GATING_ENABLED;
    expect(isPlanGatingEnabled()).toBe(false);
  });

  it("is enabled only when explicitly set to 'true'", () => {
    process.env.PLAN_GATING_ENABLED = "true";
    expect(isPlanGatingEnabled()).toBe(true);
  });

  it("stays disabled for any other value", () => {
    process.env.PLAN_GATING_ENABLED = "yes";
    expect(isPlanGatingEnabled()).toBe(false);
  });
});
