"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    const response = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interval: isYearly ? "yearly" : "monthly" }),
    });
    const result = await response.json();

    if (!result.success) {
      setIsRedirecting(false);
      toast.error(result.error ?? "Something went wrong");
      return;
    }

    window.location.href = result.data.url;
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

      <div className="flex items-center gap-3">
        <span className={cn("text-sm text-muted-foreground", !isYearly && "font-medium text-foreground")}>
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isYearly}
          aria-label="Toggle yearly pricing"
          onClick={() => setIsYearly((y) => !y)}
          className={cn(
            "relative h-6 w-11 rounded-full border border-border bg-muted transition-colors",
            isYearly && "border-primary bg-primary"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 size-4.5 rounded-full bg-background transition-transform",
              isYearly && "translate-x-5"
            )}
          />
        </button>
        <span className={cn("text-sm text-muted-foreground", isYearly && "font-medium text-foreground")}>
          Yearly <span className="text-xs text-emerald-500">(save 25%)</span>
        </span>
      </div>

      <Button className="w-fit" disabled={isRedirecting} onClick={handleUpgrade}>
        {isRedirecting && <Loader2 className="size-4 animate-spin" />}
        Upgrade to Pro — {isYearly ? "$72/yr" : "$8/mo"}
      </Button>
    </div>
  );
}
