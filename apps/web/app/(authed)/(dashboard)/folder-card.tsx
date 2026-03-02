import { FolderOpen, Loader2, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import type { schemas } from "@nestdrive/client";

type FolderType = schemas["Folder"];

export function FolderCard({
  folder,
  onRename,
  onDelete,
  isDeleting,
}: {
  folder: FolderType;
  onRename: (f: FolderType) => void;
  onDelete: (f: FolderType) => void;
  isDeleting?: boolean;
}) {
  return (
    <div className="group relative flex flex-col gap-y-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-xs transition-all hover:border-neutral-300 hover:shadow-sm">
      <Link
        href={`/?folderId=${folder.id}`}
        className="flex flex-col items-center gap-y-2"
      >
        <FolderOpen className="size-10 text-amber-400" />
        <span className="max-w-full truncate text-center text-sm font-medium">
          {folder.name}
        </span>
      </Link>

      {!isDeleting && (
        <div className="absolute right-2 top-2 hidden items-center gap-x-0.5 group-hover:flex">
          <button
            type="button"
            className="rounded p-1 hover:bg-neutral-100"
            onClick={() => onRename(folder)}
            title="Rename"
          >
            <Pencil className="size-3.5 text-neutral-500" />
          </button>
          <button
            type="button"
            className="rounded p-1 hover:bg-red-50"
            onClick={() => onDelete(folder)}
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
