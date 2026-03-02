"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@nestdrive/ui";
import { FolderPlus, Upload } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { api, fetchClient } from "~/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Breadcrumbs } from "./breadcrumbs";
import { FolderCard } from "./folder-card";
import { FileCard } from "./file-card";
import { EmptyState } from "./empty-state";
import { CreateFolderSheet } from "./create-folder-sheet";
import { RenameFolderSheet } from "./rename-folder-sheet";
import type { schemas } from "@nestdrive/client";
import type { PresignFileInput } from "@nestdrive/schemas/file";

type FolderType = schemas["Folder"];
type FileType = schemas["File"];

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const folderId = searchParams.get("folderId");

  const [createOpen, setCreateOpen] = useState(false);
  const [renamingFolder, setRenamingFolder] = useState<FolderType | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: allFolders = [], isLoading: isFoldersLoading } = api.useQuery(
    "get",
    "/v1/folders",
  );

  const { data: allFiles = [], isLoading: isFilesLoading } = api.useQuery(
    "get",
    "/v1/files",
  );

  const isLoading = isFoldersLoading || isFilesLoading;

  const {
    mutate: deleteFolder,
    isPending: isDeletingFolder,
    variables: deleteFolderVars,
  } = api.useMutation("delete", "/v1/folders/{id}", {
    onSuccess(_data, vars) {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/folders"] });
      toast.success("Folder deleted");
      const deletedId = vars.params.path.id;
      if (folderId === deletedId) {
        const deleted = allFolders.find((f) => f.id === deletedId);
        router.replace(
          deleted?.parentId ? `/?folderId=${deleted.parentId}` : "/",
        );
      }
    },
    onError(err) {
      toast.error(err.error.message);
    },
  });

  const {
    mutate: deleteFile,
    isPending: isDeletingFile,
    variables: deleteFileVars,
  } = api.useMutation("delete", "/v1/files/{id}", {
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/files"] });
      toast.success("File deleted");
    },
    onError(err) {
      toast.error(err.error.message);
    },
  });

  const { mutateAsync: presignFile } = api.useMutation(
    "post",
    "/v1/files/presign",
  );
  const { mutateAsync: confirmFile } = api.useMutation(
    "post",
    "/v1/files/confirm",
  );

  const deletingFolderId = isDeletingFolder
    ? deleteFolderVars?.params?.path?.id
    : undefined;

  const deletingFileId = isDeletingFile
    ? deleteFileVars?.params?.path?.id
    : undefined;

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

  const triggerUpload = () => fileInputRef.current?.click();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setIsUploading(true);
    try {
      const sizeMb = file.size / (1024 * 1024);

      const presignData = await presignFile({
        body: {
          name: file.name,
          mimeType: file.type as PresignFileInput["mimeType"],
          sizeMb,
          folderId: folderId ?? undefined,
        },
      });

      const uploadRes = await fetch(presignData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) throw new Error("Upload to storage failed");

      await confirmFile({
        body: {
          fileKey: presignData.fileKey,
          name: file.name,
          mimeType: file.type as PresignFileInput["mimeType"],
          sizeMb,
          folderId: folderId ?? undefined,
        },
      });

      queryClient.invalidateQueries({ queryKey: ["get", "/v1/files"] });
      toast.success("File uploaded!");
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

  const handleDownload = async (file: FileType) => {
    const { data, error } = await fetchClient.GET("/v1/files/{id}/url", {
      params: { path: { id: file.id } },
    });
    if (error) {
      toast.error("Failed to get download URL");
      return;
    }
    if (data?.url) {
      window.open(data.url, "_blank");
    }
  };

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
            onClick={triggerUpload}
            isLoading={isUploading}
            disabled={isUploading}
          >
            <Upload className="size-4" />
            Upload
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,video/*,audio/*,application/pdf"
        onChange={handleUpload}
      />

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
            onUpload={triggerUpload}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {childFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onRename={setRenamingFolder}
                onDelete={(f) =>
                  deleteFolder({ params: { path: { id: f.id } } })
                }
                isDeleting={deletingFolderId === folder.id}
              />
            ))}
            {currentFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onDownload={handleDownload}
                onDelete={(f) => deleteFile({ params: { path: { id: f.id } } })}
                isDeleting={deletingFileId === file.id}
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
    </div>
  );
}
