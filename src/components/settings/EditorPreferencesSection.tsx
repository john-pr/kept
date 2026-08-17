"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditorPreferences } from "@/components/editor/EditorPreferencesProvider";
import {
  EDITOR_THEMES,
  FONT_SIZE_OPTIONS,
  TAB_SIZE_OPTIONS,
  type EditorTheme,
} from "@/lib/editor-preferences";

const THEME_LABELS: Record<EditorTheme, string> = {
  "vs-dark": "VS Dark",
  monokai: "Monokai",
  "github-dark": "GitHub Dark",
};

export function EditorPreferencesSection() {
  const { preferences, updatePreferences } = useEditorPreferences();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="editor-font-size">Font size</Label>
          <Select
            value={String(preferences.fontSize)}
            onValueChange={(value) => updatePreferences({ fontSize: Number(value) })}
          >
            <SelectTrigger id="editor-font-size" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editor-tab-size">Tab size</Label>
          <Select
            value={String(preferences.tabSize)}
            onValueChange={(value) => updatePreferences({ tabSize: Number(value) })}
          >
            <SelectTrigger id="editor-tab-size" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TAB_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} spaces
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="editor-theme">Theme</Label>
          <Select
            value={preferences.theme}
            onValueChange={(value) => updatePreferences({ theme: value as EditorTheme })}
          >
            <SelectTrigger id="editor-theme" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EDITOR_THEMES.map((theme) => (
                <SelectItem key={theme} value={theme}>
                  {THEME_LABELS[theme]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="editor-word-wrap">Word wrap</Label>
          <p className="text-sm text-muted-foreground">
            Wrap long lines instead of scrolling horizontally.
          </p>
        </div>
        <Switch
          id="editor-word-wrap"
          checked={preferences.wordWrap}
          onCheckedChange={(checked) => updatePreferences({ wordWrap: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="editor-minimap">Minimap</Label>
          <p className="text-sm text-muted-foreground">
            Show a miniature code overview on the right edge of the editor.
          </p>
        </div>
        <Switch
          id="editor-minimap"
          checked={preferences.minimap}
          onCheckedChange={(checked) => updatePreferences({ minimap: checked })}
        />
      </div>
    </div>
  );
}
