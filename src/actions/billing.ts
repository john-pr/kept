"use server";

import { getUserStripeCustomerId, setUserPro } from "@/lib/db/users";
import { requireSessionUser } from "@/lib/auth-guard";
import type { ActionResult } from "@/types/action-result";

/**
 * Portfolio-only bypass: flips the current user to Pro without touching Stripe.
 * Lets visitors see Pro features instantly instead of clicking through test-mode
 * Checkout. Safe to leave in place alongside the real Stripe flow — it only ever
 * writes `isPro`, never Stripe fields, so it can't interfere with a real subscription.
 */
export async function activateDemoPro(): Promise<ActionResult<{ isPro: boolean }>> {
  const user = await requireSessionUser();
  if (!user) {
    return { success: false, error: "You must be signed in." };
  }

  await setUserPro(user.id, true);

  return { success: true, data: { isPro: true } };
}

/**
 * Reverts the demo Pro bypass. Refuses to touch a user with a real Stripe
 * subscription (`stripeCustomerId` set) — those users cancel via the billing
 * portal ("Manage subscription") instead, not this shortcut.
 */
export async function deactivateDemoPro(): Promise<ActionResult<{ isPro: boolean }>> {
  const user = await requireSessionUser();
  if (!user) {
    return { success: false, error: "You must be signed in." };
  }

  const stripeCustomerId = await getUserStripeCustomerId(user.id);
  if (stripeCustomerId) {
    return {
      success: false,
      error: "You have a real subscription — manage it from the billing portal instead.",
    };
  }

  await setUserPro(user.id, false);

  return { success: true, data: { isPro: false } };
}
