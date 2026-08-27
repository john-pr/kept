import { describe, expect, it } from "vitest";
import { formatDate } from "./format-date";

describe("formatDate", () => {
  it("formats a Date as '<d> <Mon> <yyyy>'", () => {
    expect(formatDate(new Date("2026-08-06T12:00:00Z"))).toBe("6 Aug 2026");
  });

  it("accepts an ISO string", () => {
    expect(formatDate("2026-08-06T12:00:00Z")).toBe("6 Aug 2026");
  });

  it("uses UTC, so a timestamp just before UTC midnight keeps its calendar day", () => {
    // 23:30 UTC on the 6th — a local-timezone formatter west of UTC would roll this
    // back to the 5th, which is exactly the hydration-mismatch class this avoids.
    expect(formatDate("2026-08-06T23:30:00Z")).toBe("6 Aug 2026");
  });

  it("does not zero-pad the day", () => {
    expect(formatDate("2026-01-01T00:00:00Z")).toBe("1 Jan 2026");
  });
});
