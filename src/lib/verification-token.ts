import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

export async function createAndSendVerificationEmail(email: string) {
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_EXPIRY_MS);

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  await sendVerificationEmail(email, token);
}