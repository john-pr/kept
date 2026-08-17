"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { updateEditorPreferences } from "@/actions/editor-preferences";
import { DEFAULT_EDITOR_PREFERENCES, type EditorPreferences } from "@/lib/editor-preferences";

interface EditorPreferencesContextValue {
  preferences: EditorPreferences;
  updatePreferences: (partial: Partial<EditorPreferences>) => void;
}

const EditorPreferencesContext = createContext<EditorPreferencesContextValue | null>(null);

export function useEditorPreferences() {
  const context = useContext(EditorPreferencesContext);
  if (!context) {
    throw new Error("useEditorPreferences must be used within an EditorPreferencesProvider");
  }
  return context;
}

export function EditorPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<EditorPreferences>(DEFAULT_EDITOR_PREFERENCES);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/editor-preferences")
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        if (!cancelled && body?.data) {
          setPreferences(body.data);
        }
      })
      .catch(() => {
        // Fall back to defaults silently — this is a background prefetch.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Applies the change immediately (so the Monaco editor updates without a
  // save button) and persists it in the background; reverts + toasts on
  // failure since there's nothing else in the UI showing save state.
  const updatePreferences = useCallback(
    (partial: Partial<EditorPreferences>) => {
      const previous = preferences;
      const next = { ...previous, ...partial };
      setPreferences(next);

      updateEditorPreferences(next).then((result) => {
        if (result.success) {
          toast.success("Editor preferences saved");
        } else {
          setPreferences(previous);
          toast.error(result.error ?? "Failed to save editor preferences");
        }
      });
    },
    [preferences]
  );

  const value = useMemo(
    () => ({ preferences, updatePreferences }),
    [preferences, updatePreferences]
  );

  return (
    <EditorPreferencesContext.Provider value={value}>
      {children}
    </EditorPreferencesContext.Provider>
  );
}
