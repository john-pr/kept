import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRequestIp, rateLimitResponse } from "@/lib/rate-limit";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  // Rate limit by session user (not just IP) since this guards a current-password
  // brute-force check against a specific, already-authenticated account.
  const rateLimit = await checkRateLimit(
    "change-password",
    `${getRequestIp(request)}:${session.user.id}`,
    5,
    15 * 60
  );
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit.reset);
  }

  const body = await request.json();
  const parsed = changePasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  if (!user.password) {
    return NextResponse.json(
      { success: false, error: "This account does not use a password" },
      { status: 400 }
    );
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return NextResponse.json({ success: true });
}