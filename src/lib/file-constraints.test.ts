import { describe, expect, it } from "vitest";
import { formatFileSize, validateFileConstraints } from "./file-constraints";

describe("validateFileConstraints", () => {
  it("accepts a valid image", () => {
    const result = validateFileConstraints("image", "photo.png", "image/png", 1024);
    expect(result).toEqual({ valid: true });
  });

  it("accepts a valid file", () => {
    const result = validateFileConstraints("file", "notes.md", "text/markdown", 1024);
    expect(result).toEqual({ valid: true });
  });

  it("rejects an unsupported extension", () => {
    const result = validateFileConstraints("image", "photo.bmp", "image/bmp", 1024);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/extension/i);
  });

  it("rejects a mismatched mime type", () => {
    const result = validateFileConstraints("image", "photo.png", "application/pdf", 1024);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/file type/i);
  });

  it("rejects an image over the 5MB limit", () => {
    const result = validateFileConstraints("image", "photo.png", "image/png", 6 * 1024 * 1024);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/too large/i);
  });

  it("rejects a file over the 10MB limit", () => {
    const result = validateFileConstraints("file", "doc.pdf", "application/pdf", 11 * 1024 * 1024);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/too large/i);
  });

  it("allows a file right at the size limit", () => {
    const result = validateFileConstraints("file", "doc.pdf", "application/pdf", 10 * 1024 * 1024);
    expect(result.valid).toBe(true);
  });
});

describe("formatFileSize", () => {
  it("formats bytes", () => {
    expect(formatFileSize(500)).toBe("500 B");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(2048)).toBe("2.0 KB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(5 * 1024 * 1024)).toBe("5.0 MB");
  });
});