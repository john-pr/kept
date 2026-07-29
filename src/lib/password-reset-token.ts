import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

const TOKEN_EXPIRY_MS = 60 * 60 * 1000;
const IDENTIFIER_PREFIX = "reset:";

export async function createAndSendPasswordResetEmail(email: string) {
  const identifier = `${IDENTIFIER_PREFIX}${email}`;

  await prisma.verificationToken.deleteMany({ where: { identifier } });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_EXPIRY_MS);

  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  await sendPasswordResetEmail(email, token);
}

export function emailFromResetIdentifier(identifier: string) {
  return identifier.startsWith(IDENTIFIER_PREFIX) ? identifier.slice(IDENTIFIER_PREFIX.length) : null;
}