import { NextResponse } from "next/server";
import { APP_URL, getStripeClient } from "@/lib/stripe";
import { getUserStripeCustomerId } from "@/lib/db/users";
import { requireApiSessionUser } from "@/lib/auth-guard";

export async function POST() {
  const user = await requireApiSessionUser();
  if (user instanceof NextResponse) return user;

  const stripeCustomerId = await getUserStripeCustomerId(user.id);

  if (!stripeCustomerId) {
    return NextResponse.json(
      { success: false, error: "No active subscription found" },
      { status: 400 }
    );
  }

  const portalSession = await getStripeClient().billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${APP_URL}/settings`,
  });

  return NextResponse.json({ success: true, data: { url: portalSession.url } });
}
