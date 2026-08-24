import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

let client: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!STRIPE_SECRET_KEY) {
    throw new Error("Stripe is not configured. Missing STRIPE_SECRET_KEY.");
  }
  if (!client) {
    client = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2026-07-29.dahlia" });
  }
  return client;
}

export const STRIPE_PRICE_ID_MONTHLY = process.env.STRIPE_PRICE_ID_MONTHLY ?? "";
export const STRIPE_PRICE_ID_YEARLY = process.env.STRIPE_PRICE_ID_YEARLY ?? "";

/** Base URL used for Stripe Checkout/Portal success/cancel/return redirects. */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
