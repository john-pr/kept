import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "./relative-time";

const now = new Date("2026-08-25T12:00:00Z");

describe("formatRelativeTime", () => {
  it("returns 'just now' for under a minute", () => {
    expect(formatRelativeTime(new Date("2026-08-25T11:59:45Z"), now)).toBe("just now");
  });

  it("formats minutes", () => {
    expect(formatRelativeTime(new Date("2026-08-25T11:45:00Z"), now)).toBe("15m ago");
  });

  it("formats hours", () => {
    expect(formatRelativeTime(new Date("2026-08-25T10:00:00Z"), now)).toBe("2h ago");
  });

  it("formats days", () => {
    expect(formatRelativeTime(new Date("2026-08-22T12:00:00Z"), now)).toBe("3d ago");
  });

  it("formats months", () => {
    expect(formatRelativeTime(new Date("2026-06-25T12:00:00Z"), now)).toBe("2mo ago");
  });

  it("clamps a future date to 'just now' instead of a negative duration", () => {
    expect(formatRelativeTime(new Date("2026-08-25T12:05:00Z"), now)).toBe("just now");
  });
});
