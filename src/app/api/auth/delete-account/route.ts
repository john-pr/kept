import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRequestIp, rateLimitResponse } from "@/lib/rate-limit";
import { requireApiSessionUser } from "@/lib/auth-guard";

export async function POST(request: NextRequest) {
  const user = await requireApiSessionUser();
  if (user instanceof NextResponse) return user;

  const rateLimit = await checkRateLimit(
    "delete-account",
    `${getRequestIp(request)}:${user.id}`,
    5,
    15 * 60
  );
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit.reset);
  }

  await prisma.user.delete({ where: { id: user.id } });

  return NextResponse.json({ success: true });
}