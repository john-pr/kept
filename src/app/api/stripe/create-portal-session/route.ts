import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { requireApiSessionUser } from "@/lib/auth-guard";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST() {
  const user = await requireApiSessionUser();
  if (user instanceof NextResponse) return user;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { stripeCustomerId: true },
  });

  if (!dbUser?.stripeCustomerId) {
    return NextResponse.json(
      { success: false, error: "No active subscription found" },
      { status: 400 }
    );
  }

  const portalSession = await getStripeClient().billingPortal.sessions.create({
    customer: dbUser.stripeCustomerId,
    return_url: `${APP_URL}/settings`,
  });

  return NextResponse.json({ success: true, data: { url: portalSession.url } });
}
