"use client";

import { useCallback, useRef, useState } from "react";
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Crown, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useEditorPreferences } from "@/components/editor/EditorPreferencesProvider";
import { explainCode } from "@/actions/ai";

const MIN_HEIGHT = 120;
const MAX_HEIGHT = 400;

// Monaco only ships vs-dark/light/hc-black/hc-light natively — monokai and
// github-dark are registered as custom themes the first time any editor
// mounts.
const handleBeforeMount: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("monokai", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "75715e" },
      { token: "string", foreground: "e6db74" },
      { token: "keyword", foreground: "f92672" },
      { token: "number", foreground: "ae81ff" },
      { token: "type", foreground: "66d9ef", fontStyle: "italic" },
      { token: "function", foreground: "a6e22e" },
    ],
    colors: {
      "editor.background": "#272822",
      "editor.foreground": "#f8f8f2",
      "editorLineNumber.foreground": "#75715e",
      "editor.lineHighlightBackground": "#3e3d32",
      "editorCursor.foreground": "#f8f8f0",
      "editor.selectionBackground": "#49483e",
    },
  });

  monaco.editor.defineTheme("github-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "8b949e" },
      { token: "string", foreground: "a5d6ff" },
      { token: "keyword", foreground: "ff7b72" },
      { token: "number", foreground: "79c0ff" },
      { token: "type", foreground: "ffa657" },
      { token: "function", foreground: "d2a8ff" },
    ],
    colors: {
      "editor.background": "#0d1117",
      "editor.foreground": "#c9d1d9",
      "editorLineNumber.foreground": "#6e7681",
      "editor.lineHighlightBackground": "#161b22",
      "editorCursor.foreground": "#c9d1d9",
      "editor.selectionBackground": "#3392ff44",
    },
  });
};

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string | null;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  /** Title of the item, required to generate an AI explanation. */
  title?: string;
  /** Whether the signed-in user is Pro — gates the Explain button. */
  isPro?: boolean;
  /** Shows the "Explain" action. Only set from the item drawer's read view
   * for snippet/command types — not in create/edit forms. */
  showExplain?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  placeholder,
  className,
  title,
  isPro = false,
  showExplain = false,
}: CodeEditorProps) {
  const { preferences } = useEditorPreferences();
  const [height, setHeight] = useState(MIN_HEIGHT);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const [tab, setTab] = useState<"code" | "explain">("code");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  const updateHeight = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const contentHeight = editor.getContentHeight();
    setHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, contentHeight)));
  }, []);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    updateHeight();
    editor.onDidContentSizeChange(updateHeight);
  };

  function handleCopy() {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  }

  async function handleExplain() {
    if (!title) return;

    setIsExplaining(true);
    const result = await explainCode({ title, content: value, language: language ?? null });
    setIsExplaining(false);

    if (result.success && result.data) {
      setExplanation(result.data);
      setTab("explain");
    } else {
      toast.error(result.error ?? "Failed to generate explanation");
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-md border border-border bg-[#1e1e1e]",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border/50 bg-[#252526] px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f56]" />
          <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="size-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex items-center gap-2">
          {explanation ? (
            <Tabs value={tab} onValueChange={(value) => value && setTab(value as "code" | "explain")}>
              <TabsList variant="line">
                <TabsTrigger value="code">Code</TabsTrigger>
                <TabsTrigger value="explain">Explanation</TabsTrigger>
              </TabsList>
            </Tabs>
          ) : (
            language && <span className="text-xs font-medium text-neutral-400">{language}</span>
          )}
          {showExplain &&
            (isPro ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-neutral-400 hover:text-neutral-100"
                onClick={handleExplain}
                disabled={isExplaining}
                title="Explain this code"
              >
                {isExplaining ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
              </Button>
            ) : (
              <span title="AI features require Pro subscription">
                <Crown className="size-3.5 text-neutral-500" />
              </span>
            ))}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-neutral-400 hover:text-neutral-100"
            onClick={handleCopy}
          >
            <Copy className="size-3.5" />
          </Button>
        </div>
      </div>

      <div style={{ height }} className="min-h-0 transition-[height] duration-100">
        <div className={cn("h-full", tab === "explain" && "hidden")}>
          <Editor
            value={value}
            language={language ?? "plaintext"}
            theme={preferences.theme}
            beforeMount={handleBeforeMount}
            onChange={(newValue) => onChange?.(newValue ?? "")}
            onMount={handleMount}
            options={{
              readOnly,
              domReadOnly: readOnly,
              minimap: { enabled: preferences.minimap },
              fontSize: preferences.fontSize,
              tabSize: preferences.tabSize,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: preferences.wordWrap ? "on" : "off",
              automaticLayout: true,
              padding: { top: 12, bottom: 12 },
              renderLineHighlight: readOnly ? "none" : "line",
              scrollbar: {
                vertical: "auto",
                horizontal: "auto",
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
                useShadows: false,
              },
              placeholder,
            }}
          />
        </div>
        {explanation && (
          <div
            className={cn(
              "markdown-preview h-full overflow-auto p-3",
              tab !== "explain" && "hidden",
            )}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{explanation}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}