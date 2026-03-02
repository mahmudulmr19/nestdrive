"use client";

import { useState, useRef } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@nestdrive/ui";
import {
  CloudUpload,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  X,
} from "lucide-react";
import { api } from "~/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PresignFileInput } from "@nestdrive/schemas/file";

// ─── helpers ────────────────────────────────────────────────────────────────

const MIME_TO_TYPE: Record<string, "IMAGE" | "VIDEO" | "PDF" | "AUDIO"> = {
  "image/jpeg": "IMAGE",
  "image/png": "IMAGE",
  "image/gif": "IMAGE",
  "image/webp": "IMAGE",
  "image/svg+xml": "IMAGE",
  "video/mp4": "VIDEO",
  "video/webm": "VIDEO",
  "video/ogg": "VIDEO",
  "application/pdf": "PDF",
  "audio/mpeg": "AUDIO",
  "audio/ogg": "AUDIO",
  "audio/wav": "AUDIO",
  "audio/webm": "AUDIO",
};

const FILE_ICONS = {
  IMAGE: FileImage,
  VIDEO: FileVideo,
  AUDIO: FileAudio,
  PDF: FileText,
} as const;

const FILE_COLORS = {
  IMAGE: "text-blue-400",
  VIDEO: "text-purple-400",
  AUDIO: "text-green-400",
  PDF: "text-red-400",
} as const;

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function uploadWithProgress(
  url: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`S3 upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

// ─── component ──────────────────────────────────────────────────────────────

export function UploadDialog({
  open,
  onOpenChange,
  folderId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string | null;
}) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const { mutateAsync: presignFile } = api.useMutation("post", "/v1/files/presign");
  const { mutateAsync: confirmFile } = api.useMutation("post", "/v1/files/confirm");

  const fileType = file ? MIME_TO_TYPE[file.type] : undefined;
  const FileIcon = fileType ? FILE_ICONS[fileType] : null;
  const iconColor = fileType ? FILE_COLORS[fileType] : "";

  const selectFile = (f: File) => {
    setFile(f);
    setProgress(0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) selectFile(f);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) selectFile(f);
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setProgress(0);
    try {
      const sizeMb = file.size / (1024 * 1024);

      const { uploadUrl, fileKey } = await presignFile({
        body: {
          name: file.name,
          mimeType: file.type as PresignFileInput["mimeType"],
          sizeMb,
          folderId: folderId ?? undefined,
        },
      });

      await uploadWithProgress(uploadUrl, file, setProgress);

      await confirmFile({
        body: {
          fileKey,
          name: file.name,
          mimeType: file.type as PresignFileInput["mimeType"],
          sizeMb,
          folderId: folderId ?? undefined,
        },
      });

      queryClient.invalidateQueries({ queryKey: ["get", "/v1/files"] });
      toast.success(`"${file.name}" uploaded successfully`);
      handleClose();
    } catch (error: unknown) {
      const msg =
        (error as { error?: { message?: string } })?.error?.message ??
        (error as { message?: string })?.message ??
        "Upload failed";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setFile(null);
    setProgress(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent
        className="p-6"
        showCloseButton={!isUploading}
      >
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-y-4">
          {/* ── No file selected: drop zone ── */}
          {!file && (
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
              }`}
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-neutral-100">
                <CloudUpload className="size-6 text-neutral-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-700">
                  Drop a file here, or{" "}
                  <span className="text-primary underline">browse</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Image, Video, PDF, Audio
                </p>
              </div>
            </div>
          )}

          {/* ── File selected: preview ── */}
          {file && !isUploading && (
            <div className="flex items-center gap-x-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              {FileIcon && (
                <FileIcon className={`size-10 shrink-0 ${iconColor}`} />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-800">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(file.size)}
                  {fileType && ` · ${fileType}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="shrink-0 rounded p-1 hover:bg-neutral-200"
                title="Remove"
              >
                <X className="size-4 text-neutral-500" />
              </button>
            </div>
          )}

          {/* ── Uploading: progress bar ── */}
          {isUploading && (
            <div className="flex flex-col gap-y-3">
              <div className="flex items-center gap-x-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                {FileIcon && (
                  <FileIcon className={`size-10 shrink-0 ${iconColor} opacity-60`} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-800">
                    {file?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Uploading…
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums text-neutral-600">
                  {progress}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-2 rounded-full bg-primary transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* ── Actions ── */}
          {!isUploading && (
            <div className="flex gap-x-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 gap-x-2"
                disabled={!file}
                onClick={handleUpload}
              >
                <CloudUpload className="size-4" />
                Upload
              </Button>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*,audio/*,application/pdf"
          onChange={handleInputChange}
        />
      </DialogContent>
    </Dialog>
  );
}
