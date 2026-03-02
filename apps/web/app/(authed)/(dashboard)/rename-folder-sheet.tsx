"use client";

import { useEffect, useState } from "react";
import { Button, Input, Sheet, SheetContent, SheetTitle } from "@nestdrive/ui";
import { api } from "~/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { schemas } from "@nestdrive/client";

type Folder = schemas["Folder"];

interface RenameFolderSheetProps {
  folder: Folder | null;
  onClose: () => void;
}

export function RenameFolderSheet({ folder, onClose }: RenameFolderSheetProps) {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (folder) setName(folder.name);
  }, [folder]);

  const { mutate, isPending } = api.useMutation("put", "/v1/folders/{id}", {
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/folders"] });
      toast.success("Folder renamed");
      onClose();
    },
    onError(err) {
      toast.error(err.error.message);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!folder || !name.trim() || name.trim() === folder.name) return;
    mutate({
      params: { path: { id: folder.id } },
      body: { name: name.trim() },
    });
  }

  return (
    <Sheet open={!!folder} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-80 p-4">
        <SheetTitle>Rename Folder</SheetTitle>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-y-4">
          <Input
            placeholder="Folder name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div className="flex gap-x-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!name.trim() || name.trim() === folder?.name}
              isLoading={isPending}
            >
              Rename
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
