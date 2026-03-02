"use client";

import { useState } from "react";
import { Button } from "@nestdrive/ui";
import { FolderPlus, Upload } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "~/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Breadcrumbs } from "./breadcrumbs";
import { FolderCard } from "./folder-card";
import { EmptyState } from "./empty-state";
import { CreateFolderSheet } from "./create-folder-sheet";
import { RenameFolderSheet } from "./rename-folder-sheet";
import type { schemas } from "@nestdrive/client";

type FolderType = schemas["Folder"];

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const folderId = searchParams.get("folderId");

  const [createOpen, setCreateOpen] = useState(false);
  const [renamingFolder, setRenamingFolder] = useState<FolderType | null>(null);

  const { data: allFolders = [], isLoading } = api.useQuery(
    "get",
    "/v1/folders",
  );

  const { mutate: deleteFolder } = api.useMutation(
    "delete",
    "/v1/folders/{id}",
    {
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
    },
  );

  const childFolders = allFolders.filter((f) => f.parentId === folderId);

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
          <Button size="sm" className="gap-x-2" disabled>
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
        ) : childFolders.length === 0 ? (
          <EmptyState onNewFolder={() => setCreateOpen(true)} />
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
