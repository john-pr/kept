import { describe, expect, it } from "vitest";
import { DEFAULT_EDITOR_PREFERENCES, parseEditorPreferences } from "./editor-preferences";

describe("parseEditorPreferences", () => {
  it("returns the defaults when given null", () => {
    expect(parseEditorPreferences(null)).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("returns the defaults when given a non-object", () => {
    expect(parseEditorPreferences("vs-dark")).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("returns the defaults for an empty object", () => {
    expect(parseEditorPreferences({})).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("passes through a fully-valid stored value", () => {
    const stored = {
      fontSize: 18,
      tabSize: 4,
      wordWrap: false,
      minimap: true,
      theme: "monokai",
    };

    expect(parseEditorPreferences(stored)).toEqual(stored);
  });

  it("falls back to defaults field-by-field for malformed values", () => {
    const malformed = {
      fontSize: "huge",
      tabSize: 4,
      wordWrap: "yes",
      minimap: true,
      theme: "solarized",
    };

    expect(parseEditorPreferences(malformed)).toEqual({
      fontSize: DEFAULT_EDITOR_PREFERENCES.fontSize,
      tabSize: 4,
      wordWrap: DEFAULT_EDITOR_PREFERENCES.wordWrap,
      minimap: true,
      theme: DEFAULT_EDITOR_PREFERENCES.theme,
    });
  });

  it("rejects an unknown theme name", () => {
    const result = parseEditorPreferences({ theme: "dracula" });
    expect(result.theme).toBe(DEFAULT_EDITOR_PREFERENCES.theme);
  });
});
