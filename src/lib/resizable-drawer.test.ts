import { describe, expect, it } from "vitest";
import {
  ITEM_DIALOG_VIEWPORT_MARGIN,
  MAX_DRAWER_WIDTH,
  MIN_ITEM_DIALOG_WIDTH,
  MIN_DRAWER_WIDTH,
  clampDrawerWidth,
  getMaxDrawerWidth,
  parseStoredDrawerWidth,
} from "./resizable-drawer";

describe("clampDrawerWidth", () => {
  it("floors values below the minimum", () => {
    expect(clampDrawerWidth(100)).toBe(MIN_DRAWER_WIDTH);
    expect(clampDrawerWidth(MIN_DRAWER_WIDTH - 1)).toBe(MIN_DRAWER_WIDTH);
  });

  it("caps values above the given max", () => {
    expect(clampDrawerWidth(5000)).toBe(MAX_DRAWER_WIDTH);
    expect(clampDrawerWidth(800, 700)).toBe(700);
  });

  it("rounds in-range values to whole pixels", () => {
    expect(clampDrawerWidth(512.4)).toBe(512);
    expect(clampDrawerWidth(512.6)).toBe(513);
  });

  it("never returns below the minimum even when max is nonsensically small", () => {
    expect(clampDrawerWidth(300, 100)).toBe(MIN_DRAWER_WIDTH);
  });

  it("falls back to the minimum for non-finite input", () => {
    expect(clampDrawerWidth(Number.NaN)).toBe(MIN_DRAWER_WIDTH);
    expect(clampDrawerWidth(Number.POSITIVE_INFINITY)).toBe(MIN_DRAWER_WIDTH);
  });
});

describe("getMaxDrawerWidth", () => {
  it("returns the hard cap when the viewport width is unknown or invalid", () => {
    expect(getMaxDrawerWidth()).toBe(MAX_DRAWER_WIDTH);
    expect(getMaxDrawerWidth(0)).toBe(MAX_DRAWER_WIDTH);
    expect(getMaxDrawerWidth(-100)).toBe(MAX_DRAWER_WIDTH);
    expect(getMaxDrawerWidth(Number.NaN)).toBe(MAX_DRAWER_WIDTH);
  });

  it("allows the full viewport width (no hard cap)", () => {
    expect(getMaxDrawerWidth(1000)).toBe(1000);
    expect(getMaxDrawerWidth(1280)).toBe(1280);
    expect(getMaxDrawerWidth(3840)).toBe(3840);
  });

  it("never drops below the minimum on very narrow screens", () => {
    expect(getMaxDrawerWidth(320)).toBe(MIN_DRAWER_WIDTH);
  });
});

describe("parseStoredDrawerWidth", () => {
  it("returns null for absent or unparseable values", () => {
    expect(parseStoredDrawerWidth(null)).toBeNull();
    expect(parseStoredDrawerWidth("")).toBeNull();
    expect(parseStoredDrawerWidth("   ")).toBeNull();
    expect(parseStoredDrawerWidth("wide")).toBeNull();
    expect(parseStoredDrawerWidth("600px")).toBeNull();
    expect(parseStoredDrawerWidth("0")).toBeNull();
    expect(parseStoredDrawerWidth("-500")).toBeNull();
  });

  it("returns the clamped value for valid input", () => {
    expect(parseStoredDrawerWidth("600")).toBe(600);
    expect(parseStoredDrawerWidth("300")).toBe(MIN_DRAWER_WIDTH);
    expect(parseStoredDrawerWidth("99999")).toBe(MAX_DRAWER_WIDTH);
    expect(parseStoredDrawerWidth("700", 640)).toBe(640);
  });
});

describe("custom min / viewport margin (New Item dialog)", () => {
  const dialogMax = (viewport?: number) =>
    getMaxDrawerWidth(viewport, { min: 500, margin: ITEM_DIALOG_VIEWPORT_MARGIN });

  it("subtracts the viewport margin from the max", () => {
    expect(getMaxDrawerWidth(1280, { margin: ITEM_DIALOG_VIEWPORT_MARGIN })).toBe(1248);
    expect(getMaxDrawerWidth(1280, { min: MIN_ITEM_DIALOG_WIDTH, margin: 32 })).toBe(1248);
  });

  it("never drops below the custom minimum", () => {
    expect(dialogMax(400)).toBe(500);
    expect(dialogMax()).toBe(MAX_DRAWER_WIDTH);
    expect(getMaxDrawerWidth(undefined, { min: 1200 })).toBe(1200);
  });

  it("clamps to the custom minimum", () => {
    expect(clampDrawerWidth(300, 1000, 500)).toBe(500);
    expect(clampDrawerWidth(Number.NaN, 1000, 500)).toBe(500);
    expect(clampDrawerWidth(700, 1000, 500)).toBe(700);
    expect(clampDrawerWidth(1200, 1000, 500)).toBe(1000);
  });

  it("parses stored values against the custom minimum", () => {
    expect(parseStoredDrawerWidth("450", 1000, 500)).toBe(500);
    expect(parseStoredDrawerWidth("800", 1000, 500)).toBe(800);
    expect(parseStoredDrawerWidth("nope", 1000, 500)).toBeNull();
  });
});
