"use client";

import { useState } from "react";
import { Button, Input, Sheet, SheetContent, SheetTitle } from "@nestdrive/ui";
import { api } from "~/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateFolderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string | null;
}

export function CreateFolderSheet({
  open,
  onOpenChange,
  parentId,
}: CreateFolderSheetProps) {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const { mutate, isPending } = api.useMutation("post", "/v1/folders", {
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["get", "/v1/folders"] });
      toast.success("Folder created");
      setName("");
      onOpenChange(false);
    },
    onError(err) {
      toast.error(err.error.message);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    mutate({
      body: { name: name.trim(), ...(parentId ? { parentId } : {}) },
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 p-4">
        <SheetTitle>New Folder</SheetTitle>
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
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!name.trim()}
              isLoading={isPending}
            >
              Create
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
