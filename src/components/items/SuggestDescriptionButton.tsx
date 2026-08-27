"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { generateDescription } from "@/actions/ai";

interface SuggestDescriptionButtonProps {
  title: string;
  content: string | null;
  url: string | null;
  language: string | null;
  fileName: string | null;
  onGenerate: (description: string) => void;
}

/** Pro-only "Suggest Description" action: calls the AI description action and
 * fills the Description field with the result. Reused by both the New Item
 * dialog and the Item Drawer edit form. */
export function SuggestDescriptionButton({
  title,
  content,
  url,
  language,
  fileName,
  onGenerate,
}: SuggestDescriptionButtonProps) {
  const t = useTranslations("aiButtons");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSuggest() {
    if (title.trim() === "") {
      toast.error(t("addTitleFirstDescription"));
      return;
    }

    setIsLoading(true);
    const result = await generateDescription({ title, content, url, language, fileName });
    setIsLoading(false);

    if (result.success && result.data) {
      onGenerate(result.data);
    } else {
      toast.error(result.error ?? t("failedDescription"));
    }
  }

  return (
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
        {t("suggestDescription")}
      </span>
    </Button>
  );
}
