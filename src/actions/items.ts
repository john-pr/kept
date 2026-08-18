"use server";

import { z } from "zod";
import { auth } from "@/auth";
import {
  createItem as createItemQuery,
  deleteItem as deleteItemQuery,
  getItemCountForUser,
  getItemForDeletion,
  getItemOwnerId,
  getItemTypeById,
  setItemFavorite,
  setItemPin,
  updateItem as updateItemQuery,
  type ItemDetail,
} from "@/lib/db/items";
import { getCollectionOptions } from "@/lib/db/collections";
import { deleteFromR2, getKeyFromPublicUrl } from "@/lib/r2";
import { isOverItemLimit, isPlanGatingEnabled, isProOnlyType } from "@/lib/plan-limits";

async function getOwnedCollectionIds(userId: string, collectionIds: string[]): Promise<string[]> {
  if (collectionIds.length === 0) return [];
  const owned = await getCollectionOptions(userId);
  const ownedIds = new Set(owned.map((collection) => collection.id));
  return collectionIds.filter((id) => ownedIds.has(id));
}

const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().nullable(),
  content: z.string().nullable(),
  url: z.union([z.string().trim().url("Invalid URL"), z.null()]),
  language: z.string().nullable(),
  tags: z.array(z.string().trim().min(1)),
  collectionIds: z.array(z.string().trim().min(1)),
});

export type UpdateItemPayload = z.infer<typeof updateItemSchema>;

const createItemSchema = z.object({
  itemTypeId: z.string().trim().min(1, "Item type is required"),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().nullable(),
  content: z.string().nullable(),
  url: z.union([z.string().trim().url("Invalid URL"), z.null()]),
  language: z.string().nullable(),
  fileUrl: z.union([z.string().trim().url("Invalid file URL"), z.null()]),
  fileName: z.string().nullable(),
  fileSize: z.number().nullable(),
  tags: z.array(z.string().trim().min(1)),
  collectionIds: z.array(z.string().trim().min(1)),
});

export type CreateItemPayload = z.infer<typeof createItemSchema>;

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function updateItem(
  itemId: string,
  data: UpdateItemPayload
): Promise<ActionResult<ItemDetail>> {
  const parsed = updateItemSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const ownerId = await getItemOwnerId(itemId);
  if (!ownerId) {
    return { success: false, error: "Item not found" };
  }
  if (ownerId !== session.user.id) {
    return { success: false, error: "Not authorized to edit this item" };
  }

  const collectionIds = await getOwnedCollectionIds(session.user.id, parsed.data.collectionIds);

  const updated = await updateItemQuery(itemId, { ...parsed.data, collectionIds });
  return { success: true, data: updated };
}

export async function createItem(data: CreateItemPayload): Promise<ActionResult<ItemDetail>> {
  const parsed = createItemSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const itemType = await getItemTypeById(parsed.data.itemTypeId);
  if (!itemType) {
    return { success: false, error: "Invalid item type" };
  }
  const typeName = itemType.name.toLowerCase();

  if (isPlanGatingEnabled()) {
    if (!session.user.isPro && isProOnlyType(typeName)) {
      return { success: false, error: "Upgrade to Pro to create this item type" };
    }
    const itemCount = await getItemCountForUser(session.user.id);
    if (isOverItemLimit(itemCount, session.user.isPro)) {
      return { success: false, error: "You've reached the free plan's item limit. Upgrade to Pro for unlimited items." };
    }
  }

  if (typeName === "link" && !parsed.data.url) {
    return { success: false, error: "URL is required for link items" };
  }
  if ((typeName === "file" || typeName === "image") && !parsed.data.fileUrl) {
    return { success: false, error: "A file upload is required" };
  }

  const collectionIds = await getOwnedCollectionIds(session.user.id, parsed.data.collectionIds);

  const created = await createItemQuery({ ...parsed.data, collectionIds, userId: session.user.id });
  return { success: true, data: created };
}

export async function deleteItem(itemId: string): Promise<ActionResult<null>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const item = await getItemForDeletion(itemId);
  if (!item) {
    return { success: false, error: "Item not found" };
  }
  if (item.userId !== session.user.id) {
    return { success: false, error: "Not authorized to delete this item" };
  }

  if (item.fileUrl) {
    const key = getKeyFromPublicUrl(item.fileUrl);
    if (key) {
      await deleteFromR2(key);
    }
  }

  await deleteItemQuery(itemId);
  return { success: true, data: null };
}

export async function toggleItemFavorite(
  itemId: string,
  isFavorite: boolean
): Promise<ActionResult<{ isFavorite: boolean }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const ownerId = await getItemOwnerId(itemId);
  if (!ownerId) {
    return { success: false, error: "Item not found" };
  }
  if (ownerId !== session.user.id) {
    return { success: false, error: "Not authorized to edit this item" };
  }

  await setItemFavorite(itemId, isFavorite);
  return { success: true, data: { isFavorite } };
}

export async function toggleItemPin(
  itemId: string,
  isPinned: boolean
): Promise<ActionResult<{ isPinned: boolean }>> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const ownerId = await getItemOwnerId(itemId);
  if (!ownerId) {
    return { success: false, error: "Item not found" };
  }
  if (ownerId !== session.user.id) {
    return { success: false, error: "Not authorized to edit this item" };
  }

  await setItemPin(itemId, isPinned);
  return { success: true, data: { isPinned } };
}