export type BillingInterval = "monthly" | "yearly";

/**
 * Starts a Stripe Checkout session for a Pro subscription and redirects the
 * browser to it on success. Returns an error result instead of throwing so
 * callers can stop their own "redirecting" loading state.
 */
export async function startProCheckout(
  interval: BillingInterval
): Promise<{ success: true } | { success: false; error: string }> {
  const response = await fetch("/api/stripe/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interval }),
  });
  const result = await response.json();

  if (!result.success) {
    return { success: false, error: result.error ?? "Something went wrong" };
  }

  window.location.href = result.data.url;
  return { success: true };
}
