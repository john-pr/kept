import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRequestIp, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit(
    "delete-account",
    `${getRequestIp(request)}:${session.user.id}`,
    5,
    15 * 60
  );
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit.reset);
  }

  await prisma.user.delete({ where: { id: session.user.id } });

  return NextResponse.json({ success: true });
}