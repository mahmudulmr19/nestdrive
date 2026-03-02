"use client";

import { useState, useEffect } from "react";
import { Button } from "@nestdrive/ui";
import { FolderPlus, Upload } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "~/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Breadcrumbs } from "./breadcrumbs";
import { FolderCard } from "./folder-card";
import { FileCard } from "./file-card";
import { EmptyState } from "./empty-state";
import { CreateFolderSheet } from "./create-folder-sheet";
import { RenameFolderSheet } from "./rename-folder-sheet";
import { UploadDialog } from "./upload-dialog";
import { FilePreviewDialog } from "./file-preview-dialog";
import type { schemas } from "@nestdrive/client";

type FolderType = schemas["Folder"];
type FileType = schemas["File"];

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const folderId = searchParams.get("folderId");

  const [createOpen, setCreateOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [renamingFolder, setRenamingFolder] = useState<FolderType | null>(null);
  const [previewFile, setPreviewFile] = useState<FileType | null>(null);

  const { data: allFolders = [], isLoading: isFoldersLoading } = api.useQuery(
    "get",
    "/v1/folders",
  );

  const { data: allFiles = [], isLoading: isFilesLoading } = api.useQuery(
    "get",
    "/v1/files",
  );

  const isLoading = isFoldersLoading || isFilesLoading;

  const [deletingFolderIds, setDeletingFolderIds] = useState<Set<string>>(
    new Set(),
  );

  const { mutate: deleteFolder } = api.useMutation(
    "delete",
    "/v1/folders/{id}",
    {
      onSuccess(_data, vars) {
        const id = vars.params.path.id;
        setDeletingFolderIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        queryClient.invalidateQueries({ queryKey: ["get", "/v1/folders"] });
        toast.success("Folder deleted");
        if (folderId === id) {
          const deleted = allFolders.find((f) => f.id === id);
          router.replace(
            deleted?.parentId ? `/?folderId=${deleted.parentId}` : "/",
          );
        }
      },
      onError(err, vars) {
        const id = vars.params.path.id;
        setDeletingFolderIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        toast.error(err.error.message);
      },
    },
  );

  const handleDeleteFolder = (f: FolderType) => {
    setDeletingFolderIds((prev) => new Set(prev).add(f.id));
    deleteFolder({ params: { path: { id: f.id } } });
  };

  const [deletingFileIds, setDeletingFileIds] = useState<Set<string>>(
    new Set(),
  );

  const { mutate: deleteFile } = api.useMutation("delete", "/v1/files/{id}", {
    onSuccess(_data, vars) {
      const id = vars.params.path.id;
      setDeletingFileIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/files"] });
      toast.success("File deleted");
    },
    onError(err, vars) {
      const id = vars.params.path.id;
      setDeletingFileIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.error(err.error.message);
    },
  });

  const handleDeleteFile = (f: FileType) => {
    setDeletingFileIds((prev) => new Set(prev).add(f.id));
    deleteFile({ params: { path: { id: f.id } } });
  };

  // Redirect to root if the folderId in the URL doesn't belong to this user
  useEffect(() => {
    if (!isFoldersLoading && folderId) {
      const exists = allFolders.some((f) => f.id === folderId);
      if (!exists) {
        toast.error("Folder not found");
        router.replace("/");
      }
    }
  }, [isFoldersLoading, folderId, allFolders, router]);

  const childFolders = allFolders.filter((f) => f.parentId === folderId);
  const currentFiles = allFiles.filter((f) => f.folderId === folderId);
  const isEmpty = childFolders.length === 0 && currentFiles.length === 0;

  return (
    <div className="flex h-full flex-col">
      {/* Topbar */}
      <div className="flex items-center justify-between border-b bg-white px-6 py-3">
        <Breadcrumbs folderId={folderId} allFolders={allFolders} />
        <div className="flex items-center gap-x-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-x-2"
            onClick={() => setCreateOpen(true)}
          >
            <FolderPlus className="size-4" />
            New Folder
          </Button>
          <Button
            size="sm"
            className="gap-x-2"
            onClick={() => setUploadOpen(true)}
          >
            <Upload className="size-4" />
            Upload
          </Button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-1 flex-col overflow-y-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl bg-neutral-100"
              />
            ))}
          </div>
        ) : isEmpty ? (
          <EmptyState
            onNewFolder={() => setCreateOpen(true)}
            onUpload={() => setUploadOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {childFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onRename={setRenamingFolder}
                onDelete={handleDeleteFolder}
                isDeleting={deletingFolderIds.has(folder.id)}
              />
            ))}
            {currentFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onPreview={setPreviewFile}
                onDelete={handleDeleteFile}
                isDeleting={deletingFileIds.has(file.id)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateFolderSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        parentId={folderId}
      />
      <RenameFolderSheet
        folder={renamingFolder}
        onClose={() => setRenamingFolder(null)}
      />
      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        folderId={folderId}
      />
      <FilePreviewDialog
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}
