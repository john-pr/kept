"use client";

import type { ReactNode } from "react";
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
  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-title`}>Title</Label>
        <Input
          id={`${idPrefix}-title`}
          placeholder={placeholders ? "e.g. Debounce hook" : undefined}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <Textarea
          id={`${idPrefix}-description`}
          placeholder={placeholders ? "A short summary of this item" : undefined}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
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
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}-language`}>Language</Label>
          <Select value={language} onValueChange={(value) => onLanguageChange(value ?? "")}>
            <SelectTrigger id={`${idPrefix}-language`} className="w-full">
              <SelectValue placeholder="Select a language" />
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
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}-content`}>Content</Label>
          {showLanguage ? (
            <CodeEditor
              value={content}
              onChange={onContentChange}
              language={language || undefined}
              placeholder={placeholders ? "Paste your code here" : undefined}
            />
          ) : showMarkdown ? (
            <MarkdownEditor
              value={content}
              onChange={onContentChange}
              placeholder={placeholders ? "Write the content here" : undefined}
            />
          ) : (
            <Textarea
              id={`${idPrefix}-content`}
              className="min-h-32 font-mono text-xs"
              placeholder={placeholders ? "Write the content here" : undefined}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
            />
          )}
        </div>
      )}

      {showUrl && (
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${idPrefix}-url`}>URL</Label>
          <Input
            id={`${idPrefix}-url`}
            placeholder={placeholders ? "https://example.com" : undefined}
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
          />
        </div>
      )}

      {children}

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-tags`}>Tags</Label>
        <Input
          id={`${idPrefix}-tags`}
          placeholder="comma, separated, tags"
          value={tags}
          onChange={(e) => onTagsChange(e.target.value)}
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
