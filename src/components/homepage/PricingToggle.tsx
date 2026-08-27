"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FeatureList } from "@/components/pricing/FeatureList";
import { PricingIntervalToggle } from "@/components/pricing/PricingIntervalToggle";
import { usePricingFeatures } from "@/hooks/usePricingFeatures";

/** Monthly/yearly switch plus the Free/Pro cards, whose Pro price depends on it. */
export function PricingToggle() {
  const [isYearly, setIsYearly] = useState(false);
  const t = useTranslations("pricing");
  const th = useTranslations("home.pricing");
  const { free, pro } = usePricingFeatures();

  return (
    <>
      <PricingIntervalToggle isYearly={isYearly} onChange={setIsYearly} className="mt-6.5" />

      <div className="mx-auto mt-13 grid max-w-2xl grid-cols-1 gap-6 text-left sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-8">
          <h3 className="mb-3.5 font-bold">{t("free")}</h3>
          <div className="mb-6 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight">$0</span>
            <span className="text-sm text-muted-foreground">{t("perMonth")}</span>
          </div>
          <FeatureList features={free} />
          <Button variant="outline" className="w-full" nativeButton={false} render={<Link href="/register" />}>
            <span className="tracking-[0.14em] uppercase">{th("getStarted")}</span>
          </Button>
        </div>

        <div className="relative border border-border border-l-2 border-l-primary bg-card p-8">
          <span className="absolute top-4 right-6 text-[10px] tracking-[0.14em] text-primary uppercase">
            {th("mostPopular")}
          </span>
          <h3 className="mb-3.5 font-bold">{t("pro")}</h3>
          <div className="mb-6 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight">{isYearly ? "$72" : "$8"}</span>
            <span className="text-sm text-muted-foreground">{isYearly ? t("perYear") : t("perMonth")}</span>
          </div>
          <FeatureList features={pro} />
          <Button className="w-full" nativeButton={false} render={<Link href="/register" />}>
            <span className="tracking-[0.14em] uppercase">{th("goPro")}</span>
          </Button>
        </div>
      </div>
    </>
  );
}
