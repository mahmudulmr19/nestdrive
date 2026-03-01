import { HardDrive } from "lucide-react";
import Link from "next/link";
import { cn } from "@nestdrive/ui";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-x-2 font-semibold", className)}
    >
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <HardDrive className="size-4" />
      </div>
      <span className="text-lg tracking-tight">NestDrive</span>
    </Link>
  );
}
