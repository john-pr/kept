import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { parseEditorPreferences, type EditorPreferences } from "@/lib/editor-preferences";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isPro: boolean;
  createdAt: Date;
  hasPassword: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionStatus: string | null;
  stripeCurrentPeriodEnd: Date | null;
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
    id: user.id,
    name: user.name ?? user.email,
    email: user.email,
    image: user.image,
    isPro: user.isPro,
    createdAt: user.createdAt,
    hasPassword: user.password !== null,
    stripeCustomerId: user.stripeCustomerId,
    stripeSubscriptionStatus: user.stripeSubscriptionStatus,
    stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
  };
}

export async function getEditorPreferences(userId: string): Promise<EditorPreferences> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { editorPreferences: true },
  });

  return parseEditorPreferences(user.editorPreferences);
}

export async function getUserStripeCustomerId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  return user?.stripeCustomerId ?? null;
}

export async function setUserPro(userId: string, isPro: boolean): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { isPro },
  });
}

export async function updateEditorPreferences(
  userId: string,
  preferences: EditorPreferences
): Promise<EditorPreferences> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { editorPreferences: preferences as unknown as Prisma.InputJsonValue },
    select: { editorPreferences: true },
  });

  return parseEditorPreferences(user.editorPreferences);
}
