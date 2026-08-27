"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format-date";
import type { Locale } from "@/lib/i18n";
import { useProCheckout } from "@/hooks/useProCheckout";
import { PricingIntervalToggle } from "@/components/pricing/PricingIntervalToggle";
import { ActivateDemoProButton, DeactivateDemoProButton } from "@/components/pricing/DemoProButtons";

interface BillingSectionProps {
  isPro: boolean;
  itemCount: number;
  itemLimit: number;
  collectionCount: number;
  collectionLimit: number;
  stripeCustomerId: string | null;
  stripeSubscriptionStatus: string | null;
  stripeCurrentPeriodEnd: Date | null;
}

export function BillingSection({
  isPro,
  itemCount,
  itemLimit,
  collectionCount,
  collectionLimit,
  stripeCustomerId,
  stripeSubscriptionStatus,
  stripeCurrentPeriodEnd,
}: BillingSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("billing");
  const tp = useTranslations("pricing");
  const tc = useTranslations("common");
  const locale = useLocale() as Locale;
  const [isYearly, setIsYearly] = useState(false);
  const { isRedirecting, startCheckout } = useProCheckout();
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      toast.success(t("nowOnPro"));
      router.replace("/settings");
    } else if (checkout === "canceled") {
      toast.info(t("checkoutCanceled"));
      router.replace("/settings");
    }
  }, [searchParams, router, t]);

  function handleUpgrade() {
    startCheckout(isYearly);
  }

  async function handleManageSubscription() {
    setIsOpeningPortal(true);
    const response = await fetch("/api/stripe/create-portal-session", { method: "POST" });
    const result = await response.json();

    if (!result.success) {
      setIsOpeningPortal(false);
      toast.error(result.error ?? tc("somethingWentWrong"));
      return;
    }

    window.location.href = result.data.url;
  }

  if (isPro) {
    const isDemoPro = !stripeCustomerId;
    const isCanceling = stripeSubscriptionStatus === "canceled" && stripeCurrentPeriodEnd;
    const periodEndLabel = stripeCurrentPeriodEnd ? formatDate(stripeCurrentPeriodEnd, locale) : null;

    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-foreground">
          {isDemoPro ? (
            <>
              <span className="font-medium">{t("demoPro")}</span> — {t("demoProNote")}
            </>
          ) : isCanceling && periodEndLabel ? (
            <>
              <span className="font-medium">{tp("pro")}</span> — {t("proCancelsOn", { date: periodEndLabel })}
            </>
          ) : periodEndLabel ? (
            <>
              <span className="font-medium">{tp("pro")}</span> — {t("proRenewsOn", { date: periodEndLabel })}
            </>
          ) : (
            <span className="font-medium">{tp("pro")}</span>
          )}
        </p>
        {isDemoPro ? (
          <DeactivateDemoProButton className="w-fit" />
        ) : (
          <Button variant="outline" className="w-fit" disabled={isOpeningPortal} onClick={handleManageSubscription}>
            {isOpeningPortal && <Loader2 className="size-4 animate-spin" />}
            {t("manageSubscription")}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">{t("items")}</p>
          <p className="text-sm font-medium text-foreground">
            {itemCount} / {itemLimit}
          </p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">{t("collections")}</p>
          <p className="text-sm font-medium text-foreground">
            {collectionCount} / {collectionLimit}
          </p>
        </div>
      </div>

      <PricingIntervalToggle isYearly={isYearly} onChange={setIsYearly} size="compact" />

      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={isRedirecting} onClick={handleUpgrade}>
          {isRedirecting && <Loader2 className="size-4 animate-spin" />}
          {t("upgradeToProPrice", {
            price: isYearly ? `$72${tp("perYear")}` : `$8${tp("perMonth")}`,
          })}
        </Button>
        <ActivateDemoProButton />
      </div>
    </div>
  );
}
