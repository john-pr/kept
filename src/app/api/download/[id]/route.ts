import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getItemById } from "@/lib/db/items";
import { getKeyFromPublicUrl, getObjectFromR2 } from "@/lib/r2";

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