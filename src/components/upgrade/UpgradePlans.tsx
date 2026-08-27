"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FREE_FEATURES, PRO_FEATURES } from "@/lib/pricing-features";
import { useProCheckout } from "@/hooks/useProCheckout";
import { FeatureList } from "@/components/pricing/FeatureList";
import { PricingIntervalToggle } from "@/components/pricing/PricingIntervalToggle";
import { ActivateDemoProButton } from "@/components/pricing/DemoProButtons";

/** Monthly/yearly toggle plus Free/Pro comparison cards; the Pro card starts Stripe Checkout. */
export function UpgradePlans() {
  const [isYearly, setIsYearly] = useState(false);
  const { isRedirecting, startCheckout } = useProCheckout();

  function handleUpgrade() {
    startCheckout(isYearly);
  }

  return (
    <>
      <PricingIntervalToggle isYearly={isYearly} onChange={setIsYearly} />

      <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-6 text-left sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-8">
          <h3 className="mb-3.5 font-bold">Free</h3>
          <div className="mb-6 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight">$0</span>
            <span className="text-sm text-muted-foreground">/mo</span>
          </div>
          <FeatureList features={FREE_FEATURES} />
          <Button variant="outline" className="w-full" disabled>
            Current Plan
          </Button>
        </div>

        <div className="relative rounded-2xl border border-primary bg-gradient-to-b from-primary/[0.08] to-card to-60% p-8 shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_20px_50px_rgba(59,130,246,0.12)]">
          <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#6366f1] px-3 py-1 text-[0.7rem] font-bold text-white">
            Most Popular
          </span>
          <h3 className="mb-3.5 font-bold">Pro</h3>
          <div className="mb-6 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight">{isYearly ? "$72" : "$8"}</span>
            <span className="text-sm text-muted-foreground">{isYearly ? "/yr" : "/mo"}</span>
          </div>
          <FeatureList features={PRO_FEATURES} />
          <Button className="w-full" disabled={isRedirecting} onClick={handleUpgrade}>
            {isRedirecting && <Loader2 className="size-4 animate-spin" />}
            Upgrade to Pro — {isYearly ? "$72/yr" : "$8/mo"}
          </Button>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Just checking out the demo? <ActivateDemoProButton className="h-auto p-0 underline underline-offset-2" />
      </p>
    </>
  );
}
