import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { emailFromResetIdentifier } from "@/lib/password-reset-token";

const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = resetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;

  const resetToken = await prisma.verificationToken.findUnique({ where: { token } });
  const email = resetToken ? emailFromResetIdentifier(resetToken.identifier) : null;

  if (!resetToken || !email) {
    return NextResponse.json({ success: false, error: "Invalid or expired reset link" }, { status: 400 });
  }

  if (resetToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: resetToken.identifier, token: resetToken.token } },
    });
    return NextResponse.json({ success: false, error: "Invalid or expired reset link" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: resetToken.identifier, token: resetToken.token } },
  });

  return NextResponse.json({ success: true });
}