import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getItemById, getItemOwnerId } from "@/lib/db/items";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const item = await getItemById(id);

  if (!item) {
    return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
  }

  const ownerId = await getItemOwnerId(id);
  const canEdit = ownerId === session.user.id;

  return NextResponse.json({ success: true, data: { ...item, canEdit } });
}