"use client";

import { useState, useEffect } from "react";
import { Download, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  Button,
} from "@nestdrive/ui";
import { fetchClient } from "~/lib/api";
import { toast } from "sonner";
import { FILE_ICONS, FILE_COLORS } from "./file-utils";
import type { schemas } from "@nestdrive/client";

type FileType = schemas["File"];

export function FilePreviewDialog({
  file,
  onClose,
}: {
  file: FileType | null;
  onClose: () => void;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    setLoading(true);
    setUrl(null);
    fetchClient
      .GET("/v1/files/{id}/url", { params: { path: { id: file.id } } })
      .then(({ data, error }) => {
        if (error || !data?.url) {
          toast.error("Failed to load file preview");
          onClose();
          return;
        }
        setUrl(data.url);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file?.id]);

  const handleDownload = async () => {
    if (!url || !file) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error("Download failed");
    }
  };

  return (
    <Dialog open={!!file} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] max-w-4xl flex-col gap-0 overflow-hidden p-0"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          <DialogTitle className="max-w-[70%] truncate text-sm font-medium">
            {file?.name}
          </DialogTitle>
          <div className="flex items-center gap-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!url}
              className="gap-x-1.5"
            >
              <Download className="size-3.5" />
              Download
            </Button>
            <DialogClose asChild>
              <button
                type="button"
                className="rounded p-1 hover:bg-neutral-100"
                aria-label="Close"
              >
                <X className="size-4 text-neutral-500" />
              </button>
            </DialogClose>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex min-h-64 flex-1 items-center justify-center overflow-auto bg-neutral-50 p-4">
          {loading && (
            <Loader2 className="size-8 animate-spin text-neutral-400" />
          )}
          {!loading && url && file && (
            <FilePreviewContent file={file} url={url} />
          )}
          {!loading && !url && file && <FallbackIcon file={file} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FilePreviewContent({ file, url }: { file: FileType; url: string }) {
  if (file.fileType === "IMAGE") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={file.name}
        className="max-h-[70vh] max-w-full rounded object-contain"
      />
    );
  }

  if (file.fileType === "VIDEO") {
    return (
      <video src={url} controls className="max-h-[70vh] max-w-full rounded" />
    );
  }

  if (file.fileType === "AUDIO") {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-y-4">
        <FallbackIcon file={file} />
        <audio src={url} controls className="w-full" />
      </div>
    );
  }

  if (file.fileType === "PDF") {
    return (
      <iframe
        src={url}
        className="h-[70vh] w-full rounded border-0"
        title={file.name}
      />
    );
  }

  return null;
}

function FallbackIcon({ file }: { file: FileType }) {
  const Icon = FILE_ICONS[file.fileType];
  const color = FILE_COLORS[file.fileType];
  return <Icon className={`size-16 ${color} opacity-40`} />;
}
