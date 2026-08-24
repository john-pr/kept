import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit, getRequestIp } from "@/lib/rate-limit";
import { requireApiSessionUser } from "@/lib/auth-guard";

export async function POST(request: NextRequest) {
  const user = await requireApiSessionUser();
  if (user instanceof NextResponse) return user;

  const limited = await enforceRateLimit("delete-account", `${getRequestIp(request)}:${user.id}`, 5, 15 * 60);
  if (limited) return limited;

  await prisma.user.delete({ where: { id: user.id } });

  return NextResponse.json({ success: true });
}