import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface CurrentUser {
  name: string;
  email: string;
  image: string | null;
  isPro: boolean;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No authenticated user");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  return {
    name: user.name ?? user.email,
    email: user.email,
    image: user.image,
    isPro: user.isPro,
  };
}
