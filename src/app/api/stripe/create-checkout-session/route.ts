import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStripeClient, STRIPE_PRICE_ID_MONTHLY, STRIPE_PRICE_ID_YEARLY } from "@/lib/stripe";
import { requireApiSessionUser } from "@/lib/auth-guard";
import { zodErrorResponse } from "@/lib/api-response";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const createCheckoutSessionSchema = z.object({
  interval: z.enum(["monthly", "yearly"]),
});

export async function POST(request: NextRequest) {
  const user = await requireApiSessionUser();
  if (user instanceof NextResponse) return user;

  const body = await request.json();
  const parsed = createCheckoutSessionSchema.safeParse(body);
  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const priceId =
    parsed.data.interval === "yearly" ? STRIPE_PRICE_ID_YEARLY : STRIPE_PRICE_ID_MONTHLY;
  if (!priceId) {
    return NextResponse.json({ success: false, error: "Stripe is not configured" }, { status: 500 });
  }

  const checkoutSession = await getStripeClient().checkout.sessions.create({
    mode: "subscription",
    client_reference_id: user.id,
    customer_email: user.email ?? undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${APP_URL}/settings?checkout=success`,
    cancel_url: `${APP_URL}/settings?checkout=canceled`,
  });

  if (!checkoutSession.url) {
    return NextResponse.json(
      { success: false, error: "Failed to create checkout session" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: { url: checkoutSession.url } });
}
