import { NextRequest, NextResponse } from "next/server";
import { getItemById } from "@/lib/db/items";
import { getCollectionOptions } from "@/lib/db/collections";
import { requireApiSessionUser } from "@/lib/auth-guard";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireApiSessionUser();
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const [item, collectionOptions] = await Promise.all([
    getItemById(id, user.id),
    getCollectionOptions(user.id),
  ]);

  if (!item) {
    return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: { ...item, canEdit: true, collectionOptions, isPro: user.isPro },
  });
}