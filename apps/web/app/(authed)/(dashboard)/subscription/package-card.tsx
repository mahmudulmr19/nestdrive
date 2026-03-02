import { Button } from "@nestdrive/ui";
import {
  CheckCircle2,
  FileText,
  Folder,
  HardDrive,
  Layers,
} from "lucide-react";
import type { schemas } from "@nestdrive/client";

type Package = schemas["SubscriptionPackage"];

export function PackageCard({
  pkg,
  isActive,
  isSwitching,
  onSelect,
}: {
  pkg: Package;
  isActive: boolean;
  isSwitching: boolean;
  onSelect: (id: string) => void;
}) {
  const fileTypes = pkg.allowedFileTypes
    .map((t) => t.charAt(0) + t.slice(1).toLowerCase())
    .join(", ");

  return (
    <div
      className={`relative flex flex-col rounded-xl border bg-white p-6 shadow-xs transition-all ${
        isActive
          ? "border-primary ring-2 ring-primary/20"
          : "border-neutral-200 hover:border-neutral-300"
      }`}
    >
      {isActive && (
        <span className="absolute -top-3 left-4 flex items-center gap-x-1 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
          <CheckCircle2 className="size-3" />
          Current Plan
        </span>
      )}

      <h3 className="text-lg font-semibold">{pkg.name}</h3>

      <ul className="mt-4 flex flex-col gap-y-2 text-sm text-muted-foreground">
        <li className="flex items-center gap-x-2">
          <Folder className="size-3.5 shrink-0 text-neutral-400" />
          <span>
            <span className="font-medium text-foreground">
              {pkg.maxFolders}
            </span>{" "}
            max folders
          </span>
        </li>
        <li className="flex items-center gap-x-2">
          <Layers className="size-3.5 shrink-0 text-neutral-400" />
          <span>
            <span className="font-medium text-foreground">
              {pkg.maxNestingLevel}
            </span>{" "}
            nesting levels
          </span>
        </li>
        <li className="flex items-center gap-x-2">
          <FileText className="size-3.5 shrink-0 text-neutral-400" />
          <span>
            File types:{" "}
            <span className="font-medium text-foreground">{fileTypes}</span>
          </span>
        </li>
        <li className="flex items-center gap-x-2">
          <HardDrive className="size-3.5 shrink-0 text-neutral-400" />
          <span>
            <span className="font-medium text-foreground">
              {pkg.maxFileSizeMb} MB
            </span>{" "}
            max file size
          </span>
        </li>
        <li className="flex items-center gap-x-2">
          <HardDrive className="size-3.5 shrink-0 text-neutral-400" />
          <span>
            <span className="font-medium text-foreground">
              {pkg.totalFileLimit}
            </span>{" "}
            total files
          </span>
        </li>
        <li className="flex items-center gap-x-2">
          <Folder className="size-3.5 shrink-0 text-neutral-400" />
          <span>
            <span className="font-medium text-foreground">
              {pkg.filesPerFolder}
            </span>{" "}
            files per folder
          </span>
        </li>
      </ul>

      <div className="mt-6">
        <Button
          className="w-full"
          variant={isActive ? "outline" : "default"}
          disabled={isActive || isSwitching}
          isLoading={isSwitching}
          onClick={() => onSelect(pkg.id)}
        >
          {isActive ? "Current Plan" : "Switch to this Plan"}
        </Button>
      </div>
    </div>
  );
}
