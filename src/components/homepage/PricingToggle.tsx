"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingToggleProps {
  freeFeatures: string[];
  proFeatures: string[];
}

function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="mb-7 flex flex-col gap-3">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
          <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" strokeWidth={2.5} />
          {feature}
        </li>
      ))}
    </ul>
  );
}

/** Monthly/yearly switch plus the Free/Pro cards, whose Pro price depends on it. */
export function PricingToggle({ freeFeatures, proFeatures }: PricingToggleProps) {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <>
      <div className="mt-6.5 flex items-center justify-center gap-3.5">
        <span
          className={cn(
            "text-sm font-semibold text-muted-foreground transition-colors",
            !isYearly && "text-foreground"
          )}
        >
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isYearly}
          aria-label="Toggle yearly pricing"
          onClick={() => setIsYearly((y) => !y)}
          className={cn(
            "relative h-6.5 w-11.5 rounded-full border border-border bg-muted transition-colors",
            isYearly && "border-primary bg-primary"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 size-5 rounded-full bg-background transition-transform",
              isYearly && "translate-x-5"
            )}
          />
        </button>
        <span
          className={cn(
            "flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors",
            isYearly && "text-foreground"
          )}
        >
          Yearly
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[0.68rem] font-bold text-emerald-500">
            Save 25%
          </span>
        </span>
      </div>

      <div className="mx-auto mt-13 grid max-w-2xl grid-cols-1 gap-6 text-left sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-8">
          <h3 className="mb-3.5 font-bold">Free</h3>
          <div className="mb-6 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold tracking-tight">$0</span>
            <span className="text-sm text-muted-foreground">/mo</span>
          </div>
          <FeatureList features={freeFeatures} />
          <Button variant="ghost" className="w-full" nativeButton={false} render={<Link href="/register" />}>
            Get Started
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
          <FeatureList features={proFeatures} />
          <Button className="w-full" nativeButton={false} render={<Link href="/register" />}>
            Go Pro
          </Button>
        </div>
      </div>
    </>
  );
}
