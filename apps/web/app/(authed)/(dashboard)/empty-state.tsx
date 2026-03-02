import { Button } from "@nestdrive/ui";
import { Folder, FolderPlus, Upload } from "lucide-react";

export function EmptyState({
  onNewFolder,
  onUpload,
}: {
  onNewFolder: () => void;
  onUpload: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-20 items-center justify-center rounded-2xl bg-neutral-100">
        <Folder className="size-10 text-neutral-400" />
      </div>
      <div>
        <p className="text-base font-medium text-neutral-700">
          This folder is empty
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a folder or upload files to get started.
        </p>
      </div>
      <div className="flex items-center gap-x-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-x-2"
          onClick={onNewFolder}
        >
          <FolderPlus className="size-4" />
          New Folder
        </Button>
        <Button size="sm" className="gap-x-2" onClick={onUpload}>
          <Upload className="size-4" />
          Upload File
        </Button>
      </div>
    </div>
  );
}
