"use client";

import { useTranslations } from "next-intl";
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

const THEME_LABEL_KEY: Record<EditorTheme, string> = {
  "vs-dark": "themeVsDark",
  monokai: "themeMonokai",
  "github-dark": "themeGithubDark",
};

export function EditorPreferencesSection() {
  const { preferences, updatePreferences } = useEditorPreferences();
  const t = useTranslations("editorPreferences");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="editor-font-size">{t("fontSize")}</Label>
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
                  {t("px", { size })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="editor-tab-size">{t("tabSize")}</Label>
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
                  {t("spaces", { count: size })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="editor-theme">{t("theme")}</Label>
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
                  {t(THEME_LABEL_KEY[theme])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="editor-word-wrap">{t("wordWrap")}</Label>
          <p className="text-sm text-muted-foreground">
            {t("wordWrapDescription")}
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
          <Label htmlFor="editor-minimap">{t("minimap")}</Label>
          <p className="text-sm text-muted-foreground">
            {t("minimapDescription")}
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
