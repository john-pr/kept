import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Stripe is the caller here (authenticated via signature verification below), not a
// signed-in user — deliberately no auth() check and no rate limiting, since this must
// never fail-closed or throttle Stripe's retries. App Router route handlers need no
// raw-body opt-out (that's a Pages Router-only concept) — request.text() already
// returns the unparsed body, which is exactly what constructEvent needs.
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      if (userId && typeof customerId === "string") {
        await prisma.user.update({
          where: { id: userId },
          data: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: typeof subscriptionId === "string" ? subscriptionId : null,
          },
        });
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer;
      const periodEndSeconds = subscription.items.data[0]?.current_period_end;
      if (typeof customerId === "string" && periodEndSeconds) {
        // Canceling in the portal runs until the current period ends (not immediate
        // revocation) — Stripe keeps status "active" with cancel_at_period_end: true
        // until the period actually ends, then fires customer.subscription.deleted.
        // So isPro stays true here regardless of cancel_at_period_end.
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            isPro: subscription.status === "active" || subscription.status === "trialing",
            stripeSubscriptionStatus: subscription.status,
            stripeCurrentPeriodEnd: new Date(periodEndSeconds * 1000),
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer;
      if (typeof customerId === "string") {
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { isPro: false, stripeSubscriptionStatus: "canceled" },
        });
      }
      break;
    }

    default:
      // Ignore unhandled event types.
      break;
  }

  return NextResponse.json({ received: true });
}
