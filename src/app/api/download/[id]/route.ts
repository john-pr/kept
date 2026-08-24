import { NextRequest, NextResponse } from "next/server";
import { getItemById } from "@/lib/db/items";
import { getKeyFromPublicUrl, getObjectFromR2 } from "@/lib/r2";
import { requireApiSessionUser } from "@/lib/auth-guard";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireApiSessionUser();
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const item = await getItemById(id, user.id);
  if (!item || !item.fileUrl) {
    return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
  }

  const key = getKeyFromPublicUrl(item.fileUrl);
  if (!key) {
    return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
  }

  try {
    const object = await getObjectFromR2(key);
    const body = object.Body;
    if (!body) {
      return NextResponse.json({ success: false, error: "File not found" }, { status: 404 });
    }

    const fileName = item.fileName ?? "download";
    return new NextResponse(body.transformToWebStream(), {
      headers: {
        "Content-Type": object.ContentType ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to download file" }, { status: 500 });
  }
}