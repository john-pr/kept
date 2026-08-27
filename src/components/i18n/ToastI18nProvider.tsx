"use client";

import { useTranslations } from "next-intl";
import { setToastStatusLabels } from "@/lib/toast";

/**
 * Pushes the localized "Success"/"Error" status words into `src/lib/toast.ts`
 * (a plain module that can't use `useTranslations()` itself). Renders nothing;
 * mounted once in the root layout inside `NextIntlClientProvider`. Runs on every
 * render so a language switch (which re-renders the tree) updates the labels.
 */
export function ToastI18nProvider() {
  const t = useTranslations("toasts");
  setToastStatusLabels({ success: t("success"), error: t("error") });
  return null;
}
