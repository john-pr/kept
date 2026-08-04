"use client";

import { useCallback, useRef, useState } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MIN_HEIGHT = 120;
const MAX_HEIGHT = 400;

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string | null;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
}

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  placeholder,
  className,
}: CodeEditorProps) {
  const [height, setHeight] = useState(MIN_HEIGHT);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

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
          {language && (
            <span className="text-xs font-medium text-neutral-400">{language}</span>
          )}
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
        <Editor
          value={value}
          language={language ?? "plaintext"}
          theme="vs-dark"
          onChange={(newValue) => onChange?.(newValue ?? "")}
          onMount={handleMount}
          options={{
            readOnly,
            domReadOnly: readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
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
    </div>
  );
}