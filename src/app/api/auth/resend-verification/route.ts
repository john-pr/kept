import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createAndSendVerificationEmail } from "@/lib/verification-token";
import { isEmailVerificationEnabled } from "@/lib/email-verification";

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
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && !user.emailVerified) {
    await createAndSendVerificationEmail(email);
  }

  return NextResponse.json({ success: true, data: null });
}