import { prisma } from "@/lib/prisma";

/**
 * Deletes a `VerificationToken` row by its composite key. Shared by both
 * email-verification (`verification-token.ts`) and password-reset
 * (`password-reset-token.ts`) consumers, since both reuse the same
 * `VerificationToken` model rather than having a dedicated table each.
 */
export async function deleteVerificationToken(token: { identifier: string; token: string }): Promise<void> {
  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: token.identifier, token: token.token } },
  });
}
