"use client";

import { useState } from "react";
import { toast } from "@/lib/toast";
import { startProCheckout } from "@/lib/stripe-client";

/**
 * Drives the "Upgrade to Pro" button on the `/upgrade` page and the `/settings`
 * billing section. Starts Stripe Checkout; on success the browser has already
 * navigated away, on failure it re-enables the button and toasts the error.
 */
export function useProCheckout() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function startCheckout(isYearly: boolean) {
    setIsRedirecting(true);
    const result = await startProCheckout(isYearly ? "yearly" : "monthly");
    if (!result.success) {
      setIsRedirecting(false);
      toast.error(result.error);
    }
  }

  return { isRedirecting, startCheckout };
}
