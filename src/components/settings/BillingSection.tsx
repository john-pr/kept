"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { startProCheckout } from "@/lib/stripe-client";
import { PricingIntervalToggle } from "@/components/pricing/PricingIntervalToggle";

interface BillingSectionProps {
  isPro: boolean;
  itemCount: number;
  itemLimit: number;
  collectionCount: number;
  collectionLimit: number;
  stripeSubscriptionStatus: string | null;
  stripeCurrentPeriodEnd: Date | null;
}

export function BillingSection({
  isPro,
  itemCount,
  itemLimit,
  collectionCount,
  collectionLimit,
  stripeSubscriptionStatus,
  stripeCurrentPeriodEnd,
}: BillingSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isYearly, setIsYearly] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (checkout === "success") {
      toast.success("You're now on Pro! It may take a moment to reflect.");
      router.replace("/settings");
    } else if (checkout === "canceled") {
      toast.info("Checkout canceled");
      router.replace("/settings");
    }
  }, [searchParams, router]);

  async function handleUpgrade() {
    setIsRedirecting(true);
    const result = await startProCheckout(isYearly ? "yearly" : "monthly");
    if (!result.success) {
      setIsRedirecting(false);
      toast.error(result.error);
    }
  }

  async function handleManageSubscription() {
    setIsRedirecting(true);
    const response = await fetch("/api/stripe/create-portal-session", { method: "POST" });
    const result = await response.json();

    if (!result.success) {
      setIsRedirecting(false);
      toast.error(result.error ?? "Something went wrong");
      return;
    }

    window.location.href = result.data.url;
  }

  if (isPro) {
    const isCanceling = stripeSubscriptionStatus === "canceled" && stripeCurrentPeriodEnd;
    const periodEndLabel = stripeCurrentPeriodEnd
      ? new Date(stripeCurrentPeriodEnd).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null;

    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-foreground">
          {isCanceling ? (
            <>
              <span className="font-medium">Pro</span> — cancels on {periodEndLabel}
            </>
          ) : periodEndLabel ? (
            <>
              <span className="font-medium">Pro</span> — renews on {periodEndLabel}
            </>
          ) : (
            <span className="font-medium">Pro</span>
          )}
        </p>
        <Button variant="outline" className="w-fit" disabled={isRedirecting} onClick={handleManageSubscription}>
          {isRedirecting && <Loader2 className="size-4 animate-spin" />}
          Manage subscription
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Items</p>
          <p className="text-sm font-medium text-foreground">
            {itemCount} / {itemLimit}
          </p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Collections</p>
          <p className="text-sm font-medium text-foreground">
            {collectionCount} / {collectionLimit}
          </p>
        </div>
      </div>

      <PricingIntervalToggle isYearly={isYearly} onChange={setIsYearly} size="compact" />

      <Button className="w-fit" disabled={isRedirecting} onClick={handleUpgrade}>
        {isRedirecting && <Loader2 className="size-4 animate-spin" />}
        Upgrade to Pro — {isYearly ? "$72/yr" : "$8/mo"}
      </Button>
    </div>
  );
}
