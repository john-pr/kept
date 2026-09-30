import { describe, expect, it } from "vitest";
import {
  MAX_AUTO_EDITOR_HEIGHT,
  MAX_MANUAL_EDITOR_HEIGHT,
  MIN_EDITOR_HEIGHT,
  clampManualEditorHeight,
  getAutoEditorHeight,
} from "./editor-height";

describe("getAutoEditorHeight", () => {
  it("fits content within the auto range", () => {
    expect(getAutoEditorHeight(250)).toBe(250);
    expect(getAutoEditorHeight(40)).toBe(MIN_EDITOR_HEIGHT);
    expect(getAutoEditorHeight(5000)).toBe(MAX_AUTO_EDITOR_HEIGHT);
  });

  it("falls back to the minimum for non-finite input", () => {
    expect(getAutoEditorHeight(Number.NaN)).toBe(MIN_EDITOR_HEIGHT);
  });
});

describe("clampManualEditorHeight", () => {
  it("allows heights past the auto-fit cap, up to the given max", () => {
    expect(clampManualEditorHeight(700, 900)).toBe(700);
    expect(clampManualEditorHeight(1000, 900)).toBe(900);
  });

  it("floors at the minimum and rounds", () => {
    expect(clampManualEditorHeight(10, 900)).toBe(MIN_EDITOR_HEIGHT);
    expect(clampManualEditorHeight(300.6, 900)).toBe(301);
  });

  it("handles bad input and nonsensical maxes", () => {
    expect(clampManualEditorHeight(Number.NaN, 900)).toBe(MIN_EDITOR_HEIGHT);
    expect(clampManualEditorHeight(500, 50)).toBe(MIN_EDITOR_HEIGHT);
    expect(clampManualEditorHeight(5000, Number.NaN)).toBe(MAX_MANUAL_EDITOR_HEIGHT);
    expect(clampManualEditorHeight(5000)).toBe(MAX_MANUAL_EDITOR_HEIGHT);
  });
});
