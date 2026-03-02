import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import type { schemas } from "@nestdrive/client";

type FolderType = schemas["Folder"];

export function Breadcrumbs({
  folderId,
  allFolders,
}: {
  folderId: string | null;
  allFolders: FolderType[];
}) {
  if (!folderId) {
    return (
      <nav className="flex items-center gap-x-1 text-sm text-muted-foreground">
        <Home className="size-3.5" />
        <span className="font-medium text-foreground">My Files</span>
      </nav>
    );
  }

  const crumbs: FolderType[] = [];
  let current = allFolders.find((f) => f.id === folderId);
  while (current) {
    crumbs.unshift(current);
    current = current.parentId
      ? allFolders.find((f) => f.id === current!.parentId)
      : undefined;
  }

  return (
    <nav className="flex items-center gap-x-1 text-sm text-muted-foreground">
      <Link
        href="/"
        className="flex items-center gap-x-1 hover:text-foreground transition-colors"
      >
        <Home className="size-3.5" />
        <span>My Files</span>
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={crumb.id} className="flex items-center gap-x-1">
          <ChevronRight className="size-3.5" />
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-foreground">{crumb.name}</span>
          ) : (
            <Link
              href={`/?folderId=${crumb.id}`}
              className="hover:text-foreground transition-colors"
            >
              {crumb.name}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
