import { describe, expect, it } from "vitest";
import { getPageCount, getPageSkip, getPaginationRange, getValidPage } from "./pagination";

describe("getPageCount", () => {
  it("computes ceiling page count", () => {
    expect(getPageCount(45, 21)).toBe(3);
  });

  it("returns 1 for zero items", () => {
    expect(getPageCount(0, 21)).toBe(1);
  });

  it("returns 1 when items fit on a single page", () => {
    expect(getPageCount(10, 21)).toBe(1);
  });
});

describe("getValidPage", () => {
  it("passes through a valid positive integer", () => {
    expect(getValidPage(3)).toBe(3);
  });

  it("clamps 0 and negatives to 1", () => {
    expect(getValidPage(0)).toBe(1);
    expect(getValidPage(-5)).toBe(1);
  });

  it("floors non-integer values", () => {
    expect(getValidPage(2.9)).toBe(2);
  });

  it("falls back to 1 for NaN/Infinity", () => {
    expect(getValidPage(NaN)).toBe(1);
    expect(getValidPage(Infinity)).toBe(1);
  });
});

describe("getPageSkip", () => {
  it("computes offset from page and perPage", () => {
    expect(getPageSkip(1, 21)).toBe(0);
    expect(getPageSkip(2, 21)).toBe(21);
    expect(getPageSkip(3, 21)).toBe(42);
  });

  it("clamps an invalid page before computing skip", () => {
    expect(getPageSkip(0, 21)).toBe(0);
    expect(getPageSkip(-2, 21)).toBe(0);
  });
});

describe("getPaginationRange", () => {
  it("returns every page when total pages is small", () => {
    expect(getPaginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("returns a single page for totalPages 1", () => {
    expect(getPaginationRange(1, 1)).toEqual([1]);
  });

  it("collapses both sides with ellipsis when current page is in the middle", () => {
    expect(getPaginationRange(5, 10)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
  });

  it("omits the leading ellipsis when near the start", () => {
    expect(getPaginationRange(2, 10)).toEqual([1, 2, 3, "ellipsis", 10]);
  });

  it("omits the trailing ellipsis when near the end", () => {
    expect(getPaginationRange(9, 10)).toEqual([1, "ellipsis", 8, 9, 10]);
  });

  it("clamps an out-of-range current page into bounds", () => {
    expect(getPaginationRange(999, 10)).toEqual([1, "ellipsis", 9, 10]);
    expect(getPaginationRange(-3, 10)).toEqual([1, 2, "ellipsis", 10]);
  });
});
