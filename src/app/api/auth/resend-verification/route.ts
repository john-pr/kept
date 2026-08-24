import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAndSendVerificationEmail } from "@/lib/verification-token";
import { isEmailVerificationEnabled } from "@/lib/email-verification";
import { enforceRateLimit, getRequestIp } from "@/lib/rate-limit";
import { zodErrorResponse } from "@/lib/api-response";

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  if (!isEmailVerificationEnabled()) {
    return NextResponse.json({ success: true, data: null });
  }

  const body = await request.json();
  const parsed = resendSchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const { email } = parsed.data;

  const ip = getRequestIp(request);
  const limited = await enforceRateLimit("resend-verification", `${ip}:${email}`, 3, 15 * 60);
  if (limited) return limited;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && !user.emailVerified) {
    await createAndSendVerificationEmail(email);
  }

  return NextResponse.json({ success: true, data: null });
}