import { describe, expect, it } from "vitest";
import { computeFillerClasses } from "./grid-filler";

const RESPONSIVE_1_2_3 = [{ cols: 1 }, { prefix: "sm", cols: 2 }, { prefix: "lg", cols: 3 }];

describe("computeFillerClasses", () => {
  it("needs no filler when the item count evenly fills every breakpoint's columns", () => {
    // 6 items: exact multiple of both 2 and 3, and of 1 trivially.
    expect(computeFillerClasses(6, RESPONSIVE_1_2_3)).toEqual([
      "hidden sm:hidden lg:hidden",
      "hidden sm:hidden lg:hidden",
    ]);
  });

  it("computes per-breakpoint filler visibility for a ragged last row", () => {
    // 5 items: base(1 col) never ragged; sm(2 cols) short 1; lg(3 cols) short 1.
    expect(computeFillerClasses(5, RESPONSIVE_1_2_3)).toEqual([
      "hidden sm:block lg:block",
      "hidden sm:hidden lg:hidden",
    ]);
  });

  it("needs the maximum filler count when short by cols-1 at the widest breakpoint", () => {
    // 4 items: sm(2 cols) exact; lg(3 cols) short 2.
    expect(computeFillerClasses(4, RESPONSIVE_1_2_3)).toEqual([
      "hidden sm:hidden lg:block",
      "hidden sm:hidden lg:block",
    ]);
  });

  it("returns an empty array when the widest breakpoint has only 1 column", () => {
    expect(computeFillerClasses(3, [{ cols: 1 }])).toEqual([]);
  });

  it("handles zero items (no filler needed since there's no ragged row to begin with)", () => {
    expect(computeFillerClasses(0, RESPONSIVE_1_2_3)).toEqual([
      "hidden sm:hidden lg:hidden",
      "hidden sm:hidden lg:hidden",
    ]);
  });

  it("omits the prefix token for the unprefixed base breakpoint", () => {
    const classes = computeFillerClasses(1, [{ cols: 2 }]);
    expect(classes[0]).toBe("block");
  });
});
