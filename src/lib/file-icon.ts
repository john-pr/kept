/** Maps a file extension to a lucide-react icon name (see `iconMap` in `icon-map.ts`). */
const EXTENSION_ICON_MAP: Record<string, string> = {
  ".pdf": "FileText",
  ".txt": "FileText",
  ".md": "FileText",
  ".json": "FileJson",
  ".yaml": "FileCode",
  ".yml": "FileCode",
  ".xml": "FileCode",
  ".csv": "FileSpreadsheet",
  ".toml": "FileCog",
  ".ini": "FileCog",
};

const DEFAULT_FILE_ICON = "File";

function getExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex === -1 ? "" : fileName.slice(dotIndex).toLowerCase();
}

/** Returns the `iconMap` key for a file, based on its extension. Falls back to a generic file icon. */
export function getFileIconName(fileName: string): string {
  return EXTENSION_ICON_MAP[getExtension(fileName)] ?? DEFAULT_FILE_ICON;
}