import { describe, expect, it } from "vitest";
import { getFileIconName } from "./file-icon";

describe("getFileIconName", () => {
  it("maps text-like extensions to FileText", () => {
    expect(getFileIconName("resume.pdf")).toBe("FileText");
    expect(getFileIconName("notes.txt")).toBe("FileText");
    expect(getFileIconName("readme.md")).toBe("FileText");
  });

  it("maps json to FileJson", () => {
    expect(getFileIconName("data.json")).toBe("FileJson");
  });

  it("maps code-like extensions to FileCode", () => {
    expect(getFileIconName("config.yaml")).toBe("FileCode");
    expect(getFileIconName("config.yml")).toBe("FileCode");
    expect(getFileIconName("data.xml")).toBe("FileCode");
  });

  it("maps csv to FileSpreadsheet", () => {
    expect(getFileIconName("export.csv")).toBe("FileSpreadsheet");
  });

  it("maps config-like extensions to FileCog", () => {
    expect(getFileIconName("settings.toml")).toBe("FileCog");
    expect(getFileIconName("app.ini")).toBe("FileCog");
  });

  it("is case-insensitive", () => {
    expect(getFileIconName("DATA.JSON")).toBe("FileJson");
  });

  it("falls back to the generic File icon for unknown or missing extensions", () => {
    expect(getFileIconName("mystery.xyz")).toBe("File");
    expect(getFileIconName("no-extension")).toBe("File");
  });
});