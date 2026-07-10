import { prisma } from "@/lib/prisma";

export interface CurrentUser {
  name: string;
  email: string;
  isPro: boolean;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const user = await prisma.user.findFirstOrThrow({
    orderBy: { createdAt: "asc" },
  });

  return { name: user.name ?? user.email, email: user.email, isPro: user.isPro };
}
