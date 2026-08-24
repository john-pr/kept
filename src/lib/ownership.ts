export type OwnershipCheck = { ok: true } | { ok: false; error: string };

/**
 * Resolves an entity's owner id and checks it against the current user.
 * Used by server actions to collapse the repeated
 * "not found" / "not authorized" branches into one call.
 */
export async function checkOwnership(
  getOwnerId: (id: string) => Promise<string | null>,
  id: string,
  userId: string,
  notFoundError: string,
  notAuthorizedError: string
): Promise<OwnershipCheck> {
  const ownerId = await getOwnerId(id);
  if (!ownerId) {
    return { ok: false, error: notFoundError };
  }
  if (ownerId !== userId) {
    return { ok: false, error: notAuthorizedError };
  }
  return { ok: true };
}
