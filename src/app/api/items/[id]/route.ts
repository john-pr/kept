import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getItemById } from "@/lib/db/items";
import { getCollectionOptions } from "@/lib/db/collections";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const [item, collectionOptions] = await Promise.all([
    getItemById(id, session.user.id),
    getCollectionOptions(session.user.id),
  ]);

  if (!item) {
    return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: { ...item, canEdit: true, collectionOptions },
  });
}