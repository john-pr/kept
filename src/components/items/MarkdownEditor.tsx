"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const MAX_HEIGHT = 400;

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
  placeholder,
  className,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState(readOnly ? "preview" : "write");

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
      <Tabs value={tab} onValueChange={(value) => value && setTab(value)}>
        <div className="flex items-center justify-between border-b border-border/50 bg-[#2d2d2d] px-3 py-2">
          {readOnly ? (
            <span className="text-xs font-medium text-neutral-400">Preview</span>
          ) : (
            <TabsList variant="line">
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
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

        {!readOnly && (
          <TabsContent
            value="write"
            className="m-0 max-h-[400px] min-h-[120px] overflow-auto"
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
          className="m-0 max-h-[400px] min-h-[120px] overflow-auto p-3"
        >
          {value.trim() === "" ? (
            <p className="text-xs text-neutral-500">{placeholder || "Nothing to preview"}</p>
          ) : (
            <div className="markdown-preview">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}