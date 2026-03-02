import {
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  Loader2,
  Trash2,
} from "lucide-react";
import type { schemas } from "@nestdrive/client";

type FileType = schemas["File"];

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

export function FileCard({
  file,
  onDownload,
  onDelete,
  isDeleting,
}: {
  file: FileType;
  onDownload: (f: FileType) => void;
  onDelete: (f: FileType) => void;
  isDeleting?: boolean;
}) {
  const Icon = FILE_ICONS[file.fileType];
  const color = FILE_COLORS[file.fileType];
  const sizeLabel =
    file.sizeMb < 1
      ? `${(file.sizeMb * 1024).toFixed(0)} KB`
      : `${file.sizeMb.toFixed(1)} MB`;

  return (
    <div className="group relative flex flex-col gap-y-1 rounded-xl border border-neutral-200 bg-white p-4 shadow-xs transition-all hover:border-neutral-300 hover:shadow-sm">
      <button
        type="button"
        className="flex w-full flex-col items-center gap-y-2"
        onClick={() => onDownload(file)}
        title="Preview / Download"
      >
        <Icon className={`size-10 ${color}`} />
        <span className="max-w-full truncate text-center text-sm font-medium">
          {file.name}
        </span>
        <span className="text-xs text-muted-foreground">{sizeLabel}</span>
      </button>

      {!isDeleting && (
        <div className="absolute right-2 top-2 hidden items-center gap-x-0.5 group-hover:flex">
          <button
            type="button"
            className="rounded p-1 hover:bg-red-50"
            onClick={() => onDelete(file)}
            title="Delete"
          >
            <Trash2 className="size-3.5 text-red-400" />
          </button>
        </div>
      )}

      {isDeleting && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-[1px]">
          <Loader2 className="size-5 animate-spin text-neutral-400" />
        </div>
      )}
    </div>
  );
}
