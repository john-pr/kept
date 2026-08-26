"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { generateAutoTags } from "@/actions/ai";

interface SuggestTagsButtonProps {
  title: string;
  content: string | null;
  existingTags: string[];
  onAcceptTag: (tag: string) => void;
}

/** Pro-only "Suggest Tags" action: calls the AI auto-tag action and shows
 * suggestions as accept/reject badges. Reused by both the New Item dialog
 * and the Item Drawer edit form. */
export function SuggestTagsButton({
  title,
  content,
  existingTags,
  onAcceptTag,
}: SuggestTagsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  async function handleSuggest() {
    if (title.trim() === "") {
      toast.error("Add a title before suggesting tags");
      return;
    }

    setIsLoading(true);
    const result = await generateAutoTags({ title, content });
    setIsLoading(false);

    if (result.success && result.data) {
      const existing = new Set(existingTags.map((tag) => tag.toLowerCase()));
      setSuggestions(result.data.filter((tag) => !existing.has(tag)));
    } else {
      toast.error(result.error ?? "Failed to generate tag suggestions");
    }
  }

  function acceptTag(tag: string) {
    onAcceptTag(tag);
    setSuggestions((current) => current.filter((suggestion) => suggestion !== tag));
  }

  function rejectTag(tag: string) {
    setSuggestions((current) => current.filter((suggestion) => suggestion !== tag));
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit self-start"
        onClick={handleSuggest}
        disabled={isLoading}
      >
        <span className="flex items-center gap-1.5 leading-none">
          {isLoading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Sparkles className="size-3.5" />
          )}
          Suggest Tags
        </span>
      </Button>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((tag) => (
            <Badge key={tag} variant="outline" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                aria-label={`Accept tag ${tag}`}
                onClick={() => acceptTag(tag)}
                className="cursor-pointer rounded p-0.5 hover:bg-muted"
              >
                <Check className="size-3" />
              </button>
              <button
                type="button"
                aria-label={`Reject tag ${tag}`}
                onClick={() => rejectTag(tag)}
                className="cursor-pointer rounded p-0.5 hover:bg-muted"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
