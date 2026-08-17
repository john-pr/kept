export const EDITOR_THEMES = ["vs-dark", "monokai", "github-dark"] as const;

export type EditorTheme = (typeof EDITOR_THEMES)[number];

export interface EditorPreferences {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  theme: EditorTheme;
}

export const FONT_SIZE_OPTIONS = [12, 13, 14, 16, 18, 20] as const;
export const TAB_SIZE_OPTIONS = [2, 4, 8] as const;

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  fontSize: 13,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  theme: "vs-dark",
};

function isEditorTheme(value: unknown): value is EditorTheme {
  return typeof value === "string" && (EDITOR_THEMES as readonly string[]).includes(value);
}

/**
 * Merges a possibly-partial, possibly-malformed value (e.g. from the `Json?`
 * DB column or an untrusted request body) on top of the defaults, so callers
 * always get a fully-populated, well-typed EditorPreferences back.
 */
export function parseEditorPreferences(value: unknown): EditorPreferences {
  if (typeof value !== "object" || value === null) {
    return { ...DEFAULT_EDITOR_PREFERENCES };
  }

  const candidate = value as Record<string, unknown>;

  return {
    fontSize:
      typeof candidate.fontSize === "number" && Number.isFinite(candidate.fontSize)
        ? candidate.fontSize
        : DEFAULT_EDITOR_PREFERENCES.fontSize,
    tabSize:
      typeof candidate.tabSize === "number" && Number.isFinite(candidate.tabSize)
        ? candidate.tabSize
        : DEFAULT_EDITOR_PREFERENCES.tabSize,
    wordWrap:
      typeof candidate.wordWrap === "boolean"
        ? candidate.wordWrap
        : DEFAULT_EDITOR_PREFERENCES.wordWrap,
    minimap:
      typeof candidate.minimap === "boolean"
        ? candidate.minimap
        : DEFAULT_EDITOR_PREFERENCES.minimap,
    theme: isEditorTheme(candidate.theme) ? candidate.theme : DEFAULT_EDITOR_PREFERENCES.theme,
  };
}
