"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setLocale } from "@/actions/i18n";
import { SUPPORTED_LOCALES, LOCALE_LABELS, isLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  /** "select" — compact dropdown for the marketing nav. "segmented" — EN | FR | PL
   * row matching `UserFooter`'s Light | Dark appearance control. */
  variant?: "select" | "segmented";
}

/** Locale picker. Persists via the `setLocale` action (cookie + `User.locale`),
 * then refreshes so server components re-render in the new language. */
export function LanguageSwitcher({ variant = "select" }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const t = useTranslations("nav");
  const [isPending, startTransition] = useTransition();

  function change(next: string | null) {
    if (!isLocale(next) || next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  if (variant === "segmented") {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
          {t("language")}
        </span>
        <div className="flex border border-border">
          {SUPPORTED_LOCALES.map((code, index) => (
            <button
              key={code}
              type="button"
              disabled={isPending}
              onClick={(event) => {
                event.stopPropagation();
                change(code);
              }}
              className={cn(
                "flex-1 cursor-pointer py-1.5 text-[10px] tracking-[0.12em] uppercase transition-colors",
                index > 0 && "border-l border-border",
                code === locale
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {code}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Select value={locale} onValueChange={change} disabled={isPending}>
      <SelectTrigger
        size="sm"
        aria-label={t("language")}
        className="h-9 w-[4.25rem] gap-1 px-2 text-[0.78rem] tracking-[0.08em] uppercase md:h-8"
      >
        <SelectValue>{locale.toUpperCase()}</SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        {SUPPORTED_LOCALES.map((code) => (
          <SelectItem key={code} value={code} label={code.toUpperCase()}>
            {LOCALE_LABELS[code]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
