"use client";

import { useRef, useState, type DragEvent } from "react";
import { useTranslations } from "next-intl";
import { File as FileIcon, Upload, X } from "lucide-react";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import {
  ALLOWED_EXTENSIONS,
  formatFileSize,
  validateFileConstraints,
  type UploadKind,
} from "@/lib/file-constraints";

export interface UploadedFile {
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

interface FileUploadProps {
  kind: UploadKind;
  value: UploadedFile | null;
  onChange: (value: UploadedFile | null) => void;
  disabled?: boolean;
}

export function FileUpload({ kind, value, onChange, disabled }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations("fileUpload");
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  function upload(file: File) {
    const validation = validateFileConstraints(kind, file.name, file.type, file.size);
    if (!validation.valid) {
      toast.error(validation.error ?? t("invalidFile"));
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      setProgress(null);
      let result: { success: boolean; data?: UploadedFile; error?: string };
      try {
        result = JSON.parse(xhr.responseText);
      } catch {
        toast.error(t("uploadFailed"));
        return;
      }

      if (result.success && result.data) {
        onChange(result.data);
      } else {
        toast.error(result.error ?? t("uploadFailed"));
      }
    };

    xhr.onerror = () => {
      setProgress(null);
      toast.error(t("uploadFailed"));
    };

    setProgress(0);
    xhr.send(formData);
  }

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) upload(file);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || progress !== null) return;
    handleFiles(e.dataTransfer.files);
  }

  const isUploading = progress !== null;
  const accept = ALLOWED_EXTENSIONS[kind].join(",");

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 p-3">
        {kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value.fileUrl}
            alt={value.fileName}
            className="size-12 shrink-0 rounded object-cover"
          />
        ) : (
          <FileIcon className="size-8 shrink-0 text-muted-foreground" />
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm text-foreground">{value.fileName}</span>
          <span className="text-xs text-muted-foreground">{formatFileSize(value.fileSize)}</span>
        </div>
        {!disabled && (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => onChange(null)}
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center transition-colors ${
        isDragging ? "border-primary bg-primary/5" : "border-border"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled && progress === null) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(e) => handleFiles(e.target.files)}
      />
      {isUploading ? (
        <div className="flex w-full flex-col gap-2">
          <span className="text-sm text-muted-foreground">{t("uploading", { progress: progress ?? 0 })}</span>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <>
          <Upload className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {kind === "image" ? t("dragDropImage") : t("dragDropFile")}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            {t("browseFiles")}
          </Button>
          <p className="text-xs text-muted-foreground">
            {ALLOWED_EXTENSIONS[kind].join(", ")}
          </p>
        </>
      )}
    </div>
  );
}