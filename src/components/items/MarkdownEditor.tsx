"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Crown, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { optimizePrompt } from "@/actions/ai";

const MAX_HEIGHT = 400;

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  /** Title of the item, required to generate an optimized prompt. */
  title?: string;
  /** Whether the signed-in user is Pro — gates the Optimize button. */
  isPro?: boolean;
  /** Shows the "Optimize" action. Only set from the item drawer's read view
   * for prompt items — not in create/edit forms or for other markdown types
   * (e.g. notes). */
  showOptimize?: boolean;
  /** Called when the user accepts an optimized prompt, with the new content.
   * The caller is responsible for persisting it (e.g. via `updateItem`). */
  onAcceptOptimized?: (content: string) => void | Promise<void>;
}

export function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
  placeholder,
  className,
  title,
  isPro = false,
  showOptimize = false,
  onAcceptOptimized,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState(readOnly ? "preview" : "write");
  const [view, setView] = useState<"original" | "optimized">("original");
  const [optimized, setOptimized] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const displayValue = view === "optimized" && optimized ? optimized : value;

  function handleCopy() {
    navigator.clipboard.writeText(displayValue);
    toast.success("Copied to clipboard");
  }

  async function handleOptimize() {
    if (!title) return;

    setIsOptimizing(true);
    const result = await optimizePrompt({ title, content: value });
    setIsOptimizing(false);

    if (result.success && result.data) {
      setOptimized(result.data);
      setView("optimized");
    } else {
      toast.error(result.error ?? "Failed to optimize prompt");
    }
  }

  async function handleAccept() {
    if (!optimized || isAccepting) return;
    setIsAccepting(true);
    await onAcceptOptimized?.(optimized);
    setIsAccepting(false);
    setOptimized(null);
    setView("original");
  }

  function handleDiscard() {
    setOptimized(null);
    setView("original");
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-md border border-border bg-[#1e1e1e]",
        className,
      )}
    >
      <Tabs value={tab} onValueChange={(value) => value && setTab(value)}>
        <div className="flex items-center justify-between border-b border-border/50 bg-[#2d2d2d] px-3 py-2">
          {readOnly ? (
            optimized ? (
              <div className="flex gap-1">
                {(["original", "optimized"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setView(option)}
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-xs font-medium capitalize transition-colors",
                      view === option
                        ? "bg-background text-foreground"
                        : "text-neutral-400 hover:text-neutral-100",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-xs font-medium text-neutral-400">Preview</span>
            )
          ) : (
            <TabsList variant="line">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          )}
          <div className="flex items-center gap-2">
            {showOptimize &&
              (isPro ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-neutral-400 hover:text-neutral-100"
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                  title="Optimize this prompt"
                >
                  {isOptimizing ? (
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

        {!readOnly && (
          <TabsContent
            value="write"
            className="m-0 max-h-[400px] min-h-[120px] overflow-auto [contain:layout]"
          >
            <Textarea
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              placeholder={placeholder}
              className="min-h-[120px] resize-none rounded-none border-none bg-transparent font-mono text-xs text-neutral-100 shadow-none focus-visible:ring-0 dark:bg-transparent"
              style={{ maxHeight: MAX_HEIGHT }}
            />
          </TabsContent>
        )}

        <TabsContent
          value="preview"
          className="m-0 max-h-[400px] min-h-[120px] overflow-auto p-3 [contain:layout]"
        >
          {displayValue.trim() === "" ? (
            <p className="text-xs text-neutral-500">{placeholder || "Nothing to preview"}</p>
          ) : (
            <div className="markdown-preview">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayValue}</ReactMarkdown>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {readOnly && optimized && view === "optimized" && (
        <div className="flex items-center justify-end gap-2 border-t border-border/50 bg-[#2d2d2d] px-3 py-2">
          <Button type="button" variant="ghost" size="sm" onClick={handleDiscard} disabled={isAccepting}>
            Keep original
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={handleAccept} disabled={isAccepting}>
            {isAccepting && <Loader2 className="size-3.5 animate-spin" />}
            Use this version
          </Button>
        </div>
      )}
    </div>
  );
}
