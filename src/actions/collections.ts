"use server";

import { z } from "zod";
import { auth } from "@/auth";
import {
  createCollection as createCollectionQuery,
  deleteCollection as deleteCollectionQuery,
  getCollectionCountForUser,
  getCollectionOwnerId,
  setCollectionFavorite,
  updateCollection as updateCollectionQuery,
  type CollectionSummary,
} from "@/lib/db/collections";
import { isOverCollectionLimit, isPlanGatingEnabled } from "@/lib/plan-limits";
import { checkOwnership } from "@/lib/ownership";

const createCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().nullable(),
});

export type CreateCollectionPayload = z.infer<typeof createCollectionSchema>;

const updateCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().nullable(),
});

export type UpdateCollectionPayload = z.infer<typeof updateCollectionSchema>;

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function createCollection(
  data: CreateCollectionPayload
): Promise<ActionResult<CollectionSummary>> {
  const parsed = createCollectionSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  if (isPlanGatingEnabled()) {
    const collectionCount = await getCollectionCountForUser(session.user.id);
    if (isOverCollectionLimit(collectionCount, session.user.isPro)) {
      return {
        success: false,
        error: "You've reached the free plan's collection limit. Upgrade to Pro for unlimited collections.",
      };
    }
  }

  const created = await createCollectionQuery({ ...parsed.data, userId: session.user.id });
  return { success: true, data: created };
}

export async function updateCollection(
  id: string,
  data: UpdateCollectionPayload
): Promise<ActionResult<CollectionSummary>> {
  const parsed = updateCollectionSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const ownership = await checkOwnership(getCollectionOwnerId, id, session.user.id, "Collection not found", "Not authorized to edit this collection");
  if (!ownership.ok) {
    return { success: false, error: ownership.error };
  }

  const updated = await updateCollectionQuery(id, parsed.data);
  return { success: true, data: updated };
}

export async function deleteCollection(id: string): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const ownership = await checkOwnership(getCollectionOwnerId, id, session.user.id, "Collection not found", "Not authorized to delete this collection");
  if (!ownership.ok) {
    return { success: false, error: ownership.error };
  }

  await deleteCollectionQuery(id);
  return { success: true, data: null };
}

export async function toggleCollectionFavorite(
  id: string,
  isFavorite: boolean
): Promise<ActionResult<{ isFavorite: boolean }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const ownership = await checkOwnership(getCollectionOwnerId, id, session.user.id, "Collection not found", "Not authorized to edit this collection");
  if (!ownership.ok) {
    return { success: false, error: ownership.error };
  }

  await setCollectionFavorite(id, isFavorite);
  return { success: true, data: { isFavorite } };
}