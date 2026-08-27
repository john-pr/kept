"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CodeEditor } from "@/components/items/CodeEditor";
import { MarkdownEditor } from "@/components/items/MarkdownEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { parseTagsInput } from "@/lib/tags";
import { SuggestTagsButton } from "@/components/items/SuggestTagsButton";
import { SuggestDescriptionButton } from "@/components/items/SuggestDescriptionButton";

interface ItemFormFieldsProps {
  /** Prefixes each field's `id`/`htmlFor` (e.g. "new-item" vs "item"), keeping ids unique per form. */
  idPrefix: string;
  title: string;
  onTitleChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  content: string;
  onContentChange: (value: string) => void;
  language: string;
  onLanguageChange: (value: string) => void;
  url: string;
  onUrlChange: (value: string) => void;
  tags: string;
  onTagsChange: (value: string) => void;
  onAcceptTag: (tag: string) => void;
  showContent: boolean;
  showLanguage: boolean;
  showMarkdown: boolean;
  showUrl: boolean;
  isPro: boolean;
  /** Passed to the description AI button; the create form's newly-uploaded file name, or the existing item's. */
  fileName: string | null;
  /** Shows field placeholders (create mode). Edit mode omits them (default). */
  placeholders?: boolean;
  /** Rendered between the URL field and Tags (e.g. the create dialog's file-upload field). */
  children?: ReactNode;
}

const LABEL_CLASS = "text-[10px] tracking-[0.14em] text-muted-foreground uppercase";
const FIELD_CLASS = "rounded-none border-border bg-muted text-[13px]";

/**
 * Shared Title -> Description -> Language -> Content -> URL -> Tags field
 * sequence used by both `NewItemDialog` (create) and `ItemDrawerEditForm`
 * (edit). Callers render their own Type field and `CollectionMultiSelect`
 * around this — those differ too much (editable vs. static Type, and a
 * different position relative to Tags) to fit the same shared block.
 */
export function ItemFormFields({
  idPrefix,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  content,
  onContentChange,
  language,
  onLanguageChange,
  url,
  onUrlChange,
  tags,
  onTagsChange,
  onAcceptTag,
  showContent,
  showLanguage,
  showMarkdown,
  showUrl,
  isPro,
  fileName,
  placeholders = false,
  children,
}: ItemFormFieldsProps) {
  const t = useTranslations("itemForm");
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-title`} className={LABEL_CLASS}>
          {t("title")}
        </Label>
        <Input
          id={`${idPrefix}-title`}
          placeholder={placeholders ? t("placeholderTitle") : undefined}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={`h-[38px] ${FIELD_CLASS}`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-description`} className={LABEL_CLASS}>
          {t("description")}
        </Label>
        <Textarea
          id={`${idPrefix}-description`}
          placeholder={placeholders ? t("placeholderDescription") : undefined}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className={FIELD_CLASS}
        />
        {isPro && (
          <SuggestDescriptionButton
            title={title}
            content={showContent ? content : null}
            url={showUrl ? url : null}
            language={showLanguage ? language : null}
            fileName={fileName}
            onGenerate={onDescriptionChange}
          />
        )}
      </div>

      {showLanguage && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-language`} className={LABEL_CLASS}>
            {t("language")}
          </Label>
          <Select value={language} onValueChange={(value) => onLanguageChange(value ?? "")}>
            <SelectTrigger id={`${idPrefix}-language`} className={`h-[38px] w-full ${FIELD_CLASS}`}>
              <SelectValue placeholder={t("selectLanguage")} />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              {LANGUAGE_OPTIONS.map((lang) => (
                <SelectItem key={lang.value} value={lang.value} label={lang.label}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showContent && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-content`} className={LABEL_CLASS}>
            {t("content")}
          </Label>
          {showLanguage ? (
            <CodeEditor
              value={content}
              onChange={onContentChange}
              language={language || undefined}
              placeholder={placeholders ? t("placeholderCode") : undefined}
            />
          ) : showMarkdown ? (
            <MarkdownEditor
              value={content}
              onChange={onContentChange}
              placeholder={placeholders ? t("placeholderContent") : undefined}
            />
          ) : (
            <Textarea
              id={`${idPrefix}-content`}
              className={`min-h-32 font-mono text-xs ${FIELD_CLASS}`}
              placeholder={placeholders ? t("placeholderContent") : undefined}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
            />
          )}
        </div>
      )}

      {showUrl && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${idPrefix}-url`} className={LABEL_CLASS}>
            {t("url")}
          </Label>
          <Input
            id={`${idPrefix}-url`}
            placeholder={placeholders ? t("placeholderUrl") : undefined}
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            className={`h-[38px] ${FIELD_CLASS}`}
          />
        </div>
      )}

      {children}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${idPrefix}-tags`} className={LABEL_CLASS}>
          {t("tags")}
        </Label>
        <Input
          id={`${idPrefix}-tags`}
          placeholder={t("placeholderTags")}
          value={tags}
          onChange={(e) => onTagsChange(e.target.value)}
          className={`h-[38px] ${FIELD_CLASS}`}
        />
        {isPro && (
          <SuggestTagsButton
            title={title}
            content={showContent ? content : description || null}
            existingTags={parseTagsInput(tags)}
            onAcceptTag={onAcceptTag}
          />
        )}
      </div>
    </>
  );
}
