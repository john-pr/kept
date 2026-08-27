import { describe, expect, it } from "vitest";
import {
  MAX_DRAWER_WIDTH,
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
