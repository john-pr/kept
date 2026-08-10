export type UploadKind = "file" | "image";

export const MAX_FILE_SIZE_BYTES: Record<UploadKind, number> = {
  image: 5 * 1024 * 1024,
  file: 10 * 1024 * 1024,
};

export const ALLOWED_EXTENSIONS: Record<UploadKind, string[]> = {
  // .svg is intentionally excluded: SVGs can embed <script>/event-handler attributes,
  // and files are served back from a raw R2 URL with no sanitization step, which
  // would let an uploaded SVG execute script in the R2 origin's context if opened directly.
  image: [".png", ".jpg", ".jpeg", ".gif", ".webp"],
  file: [".pdf", ".txt", ".md", ".json", ".yaml", ".yml", ".xml", ".csv", ".toml", ".ini"],
};

export const ALLOWED_MIME_TYPES: Record<UploadKind, string[]> = {
  image: ["image/png", "image/jpeg", "image/gif", "image/webp"],
  file: [
    "application/pdf",
    "text/plain",
    "text/markdown",
    "application/json",
    "application/x-yaml",
    "text/yaml",
    "application/xml",
    "text/xml",
    "text/csv",
    "application/toml",
  ],
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

function getExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex === -1 ? "" : fileName.slice(dotIndex).toLowerCase();
}

export function validateFileConstraints(
  kind: UploadKind,
  fileName: string,
  mimeType: string,
  size: number
): FileValidationResult {
  const extension = getExtension(fileName);
  if (!ALLOWED_EXTENSIONS[kind].includes(extension)) {
    return {
      valid: false,
      error: `Unsupported file extension. Allowed: ${ALLOWED_EXTENSIONS[kind].join(", ")}`,
    };
  }

  // .ini files report as text/plain, which is also a valid file mime type, so no special-case needed.
  if (!ALLOWED_MIME_TYPES[kind].includes(mimeType)) {
    return { valid: false, error: `Unsupported file type: ${mimeType}` };
  }

  if (size > MAX_FILE_SIZE_BYTES[kind]) {
    const maxMb = MAX_FILE_SIZE_BYTES[kind] / (1024 * 1024);
    return { valid: false, error: `File too large. Maximum size is ${maxMb}MB` };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}