import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { validateFileConstraints, type UploadKind } from "@/lib/file-constraints";
import { uploadToR2 } from "@/lib/r2";
import { requireApiSessionUser } from "@/lib/auth-guard";

const VALID_KINDS = new Set<UploadKind>(["file", "image"]);

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request: NextRequest) {
  const user = await requireApiSessionUser();
  if (user instanceof NextResponse) return user;

  const formData = await request.formData();
  const file = formData.get("file");
  const kind = formData.get("kind");

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
  }
  if (typeof kind !== "string" || !VALID_KINDS.has(kind as UploadKind)) {
    return NextResponse.json({ success: false, error: "Invalid upload kind" }, { status: 400 });
  }

  const validation = validateFileConstraints(kind as UploadKind, file.name, file.type, file.size);
  if (!validation.valid) {
    return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `${user.id}/${randomUUID()}-${sanitizeFileName(file.name)}`;

  try {
    const fileUrl = await uploadToR2(key, buffer, file.type);
    return NextResponse.json({
      success: true,
      data: { fileUrl, fileName: file.name, fileSize: file.size },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to upload file" }, { status: 500 });
  }
}