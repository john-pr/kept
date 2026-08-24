import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRequestIp, rateLimitResponse } from "@/lib/rate-limit";
import { requireApiSessionUser } from "@/lib/auth-guard";
import { zodErrorResponse } from "@/lib/api-response";

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
  const user = await requireApiSessionUser();
  if (user instanceof NextResponse) return user;

  // Rate limit by session user (not just IP) since this guards a current-password
  // brute-force check against a specific, already-authenticated account.
  const rateLimit = await checkRateLimit(
    "change-password",
    `${getRequestIp(request)}:${user.id}`,
    5,
    15 * 60
  );
  if (!rateLimit.success) {
    return rateLimitResponse(rateLimit.reset);
  }

  const body = await request.json();
  const parsed = changePasswordSchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const { currentPassword, newPassword } = parsed.data;

  const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!dbUser.password) {
    return NextResponse.json(
      { success: false, error: "This account does not use a password" },
      { status: 400 }
    );
  }

  const isValid = await bcrypt.compare(currentPassword, dbUser.password);
  if (!isValid) {
    return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: dbUser.id },
    data: { password: hashedPassword },
  });

  return NextResponse.json({ success: true });
}