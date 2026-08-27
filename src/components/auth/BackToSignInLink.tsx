"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export function BackToSignInLink() {
  const t = useTranslations("auth");
  return (
    <p className="text-center text-sm text-muted-foreground">
      <Link
        href="/sign-in"
        className="inline-flex items-center gap-1 text-foreground underline underline-offset-4"
      >
        <ArrowLeft className="size-3.5" />
        {t("backToSignIn")}
      </Link>
    </p>
  );
}
