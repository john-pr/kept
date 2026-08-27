"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePricingFeatures } from "@/hooks/usePricingFeatures";
import { useProCheckout } from "@/hooks/useProCheckout";
import { FeatureList } from "@/components/pricing/FeatureList";
import { PricingIntervalToggle } from "@/components/pricing/PricingIntervalToggle";
import { ActivateDemoProButton } from "@/components/pricing/DemoProButtons";

/** Monthly/yearly toggle plus Free/Pro comparison cards; the Pro card starts Stripe Checkout. */
export function UpgradePlans() {
  const [isYearly, setIsYearly] = useState(false);
  const { isRedirecting, startCheckout } = useProCheckout();
  const t = useTranslations("upgradePage");
  const tp = useTranslations("pricing");
  const { free, pro } = usePricingFeatures();

  function handleUpgrade() {
    startCheckout(isYearly);
  }

  return (
    <>
      <PricingIntervalToggle isYearly={isYearly} onChange={setIsYearly} />

      <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-6 text-left sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-8">
          <h3 className="mb-3.5 font-bold">{tp("free")}</h3>
          <div className="mb-6 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight">$0</span>
            <span className="text-sm text-muted-foreground">{tp("perMonth")}</span>
          </div>
          <FeatureList features={free} />
          <Button variant="outline" className="w-full" disabled>
            {t("currentPlan")}
          </Button>
        </div>

        <div className="relative rounded-2xl border border-primary bg-gradient-to-b from-primary/[0.08] to-card to-60% p-8 shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_20px_50px_rgba(59,130,246,0.12)]">
          <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#6366f1] px-3 py-1 text-[0.7rem] font-bold text-white">
            {t("mostPopular")}
          </span>
          <h3 className="mb-3.5 font-bold">{tp("pro")}</h3>
          <div className="mb-6 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight">{isYearly ? "$72" : "$8"}</span>
            <span className="text-sm text-muted-foreground">{isYearly ? tp("perYear") : tp("perMonth")}</span>
          </div>
          <FeatureList features={pro} />
          <Button className="w-full" disabled={isRedirecting} onClick={handleUpgrade}>
            {isRedirecting && <Loader2 className="size-4 animate-spin" />}
            {t("upgradeToProPrice", {
              price: isYearly ? `$72${tp("perYear")}` : `$8${tp("perMonth")}`,
            })}
          </Button>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        {t("justCheckingDemo")}{" "}
        <ActivateDemoProButton className="h-auto p-0 underline underline-offset-2" />
      </p>
    </>
  );
}
