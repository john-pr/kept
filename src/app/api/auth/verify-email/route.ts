import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isEmailVerificationEnabled } from "@/lib/email-verification";

export async function GET(request: NextRequest) {
  const appUrl = request.nextUrl.origin;

  if (!isEmailVerificationEnabled()) {
    return NextResponse.redirect(`${appUrl}/sign-in`);
  }

  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${appUrl}/sign-in?verifyError=missing-token`);
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    if (verificationToken) {
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationToken.identifier,
            token: verificationToken.token,
          },
        },
      });
    }
    return NextResponse.redirect(`${appUrl}/sign-in?verifyError=expired-token`);
  }

  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: verificationToken.identifier,
        token: verificationToken.token,
      },
    },
  });

  return NextResponse.redirect(`${appUrl}/sign-in?verified=1`);
}