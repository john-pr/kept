import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAndSendPasswordResetEmail } from "@/lib/password-reset-token";
import { enforceRateLimit, getRequestIp } from "@/lib/rate-limit";
import { zodErrorResponse } from "@/lib/api-response";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);
  const limited = await enforceRateLimit("forgot-password", ip, 3, 60 * 60);
  if (limited) return limited;

  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    await createAndSendPasswordResetEmail(email);
  }

  return NextResponse.json({ success: true });
}