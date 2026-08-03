"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { getItemOwnerId, updateItem as updateItemQuery, type ItemDetail } from "@/lib/db/items";

const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().nullable(),
  content: z.string().nullable(),
  url: z.union([z.string().trim().url("Invalid URL"), z.null()]),
  language: z.string().nullable(),
  tags: z.array(z.string().trim().min(1)),
});

export type UpdateItemPayload = z.infer<typeof updateItemSchema>;

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

  const updated = await updateItemQuery(itemId, parsed.data);
  return { success: true, data: updated };
}