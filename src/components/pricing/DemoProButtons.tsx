"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { activateDemoPro, deactivateDemoPro } from "@/actions/billing";

interface DemoProButtonProps {
  className?: string;
}

/**
 * Portfolio-only bypass buttons for the Pro gate — see `src/actions/billing.ts`.
 * Shown alongside the real Stripe test-mode Checkout/portal flow, not in place of it.
 */
export function ActivateDemoProButton({ className }: DemoProButtonProps) {
  const router = useRouter();
  const t = useTranslations("demoPro");
  const tc = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    const result = await activateDemoPro();
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error ?? tc("somethingWentWrong"));
      return;
    }

    toast.success(t("activated"));
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" className={className} disabled={isLoading} onClick={handleClick}>
      {isLoading && <Loader2 className="size-4 animate-spin" />}
      {t("tryInstantly")}
    </Button>
  );
}

export function DeactivateDemoProButton({ className }: DemoProButtonProps) {
  const router = useRouter();
  const t = useTranslations("demoPro");
  const tc = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);

  async function handleClick() {
    setIsLoading(true);
    const result = await deactivateDemoPro();
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error ?? tc("somethingWentWrong"));
      return;
    }

    toast.success(t("reverted"));
    router.refresh();
  }

  return (
    <Button variant="outline" size="sm" className={className} disabled={isLoading} onClick={handleClick}>
      {isLoading && <Loader2 className="size-4 animate-spin" />}
      {t("revert")}
    </Button>
  );
}
