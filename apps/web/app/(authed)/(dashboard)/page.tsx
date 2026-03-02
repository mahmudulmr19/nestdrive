"use client";

import { Button } from "@nestdrive/ui";
import { FolderPlus, Upload, Folder, Home, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function Breadcrumbs({ folderId }: { folderId: string | null }) {
  return (
    <nav className="flex items-center gap-x-1 text-sm text-muted-foreground">
      <Link
        href="/"
        className="flex items-center gap-x-1 hover:text-foreground transition-colors"
      >
        <Home className="size-3.5" />
        <span>My Files</span>
      </Link>
      {folderId && (
        <>
          <ChevronRight className="size-3.5" />
          {/* Folder name will be fetched and shown here once API is ready */}
          <span className="text-foreground font-medium">Folder</span>
        </>
      )}
    </nav>
  );
}

function EmptyState({ folderId }: { folderId: string | null }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-20 items-center justify-center rounded-2xl bg-neutral-100">
        <Folder className="size-10 text-neutral-400" />
      </div>
      <div>
        <p className="text-base font-medium text-neutral-700">
          {folderId ? "This folder is empty" : "No files yet"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a folder or upload files to get started.
        </p>
      </div>
      <div className="flex items-center gap-x-2">
        <Button variant="outline" size="sm" className="gap-x-2">
          <FolderPlus className="size-4" />
          New Folder
        </Button>
        <Button size="sm" className="gap-x-2">
          <Upload className="size-4" />
          Upload File
        </Button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");

  return (
    <div className="flex h-full flex-col">
      {/* Topbar */}
      <div className="flex items-center justify-between border-b bg-white px-6 py-3">
        <Breadcrumbs folderId={folderId} />
        <div className="flex items-center gap-x-2">
          <Button variant="outline" size="sm" className="gap-x-2">
            <FolderPlus className="size-4" />
            New Folder
          </Button>
          <Button size="sm" className="gap-x-2">
            <Upload className="size-4" />
            Upload
          </Button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-1 flex-col overflow-y-auto p-6">
        {/*
          Files and folders grid will be rendered here.
          For now, show empty state.
        */}
        <EmptyState folderId={folderId} />
      </div>
    </div>
  );
}
