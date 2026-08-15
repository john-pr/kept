"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { createCollection as createCollectionQuery, type CollectionSummary } from "@/lib/db/collections";

const createCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().nullable(),
});

export type CreateCollectionPayload = z.infer<typeof createCollectionSchema>;

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

  const created = await createCollectionQuery({ ...parsed.data, userId: session.user.id });
  return { success: true, data: created };
}