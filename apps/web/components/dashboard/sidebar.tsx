"use client";

import { Button, Separator, cn } from "@nestdrive/ui";
import { HardDrive, LogOut, CreditCard, LayoutDashboard } from "lucide-react";
import { Logo } from "~/components/logo";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "~/lib/auth";

export function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, signOut } = useAuth();

  const currentFolderId = searchParams.get("folderId");
  const isAtRoot = pathname === "/" && !currentFolderId;

  function handleSignOut() {
    signOut();
    onLinkClick?.();
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Logo */}
      <div className="flex flex-col p-4 px-6">
        <Logo />
      </div>

      <Separator />

      {/* Nav */}
      <div className="flex flex-1 flex-col gap-y-1 overflow-y-auto p-4">
        <p className="mb-1 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Storage
        </p>

        <Button
          className={cn(
            "justify-start gap-x-2",
            isAtRoot && "bg-accent text-accent-foreground",
          )}
          variant="ghost"
          size="lg"
          asChild
        >
          <Link href="/" onClick={onLinkClick}>
            <HardDrive className="size-4" />
            My Files
          </Link>
        </Button>

        {/* Folder tree will be inserted here when API is ready */}
        <div className="mt-1 pl-4 text-sm text-muted-foreground">
          {/* dynamic folder tree goes here */}
        </div>

        <Separator className="my-2" />

        <p className="mb-1 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Account
        </p>

        <Button
          className={cn(
            "justify-start gap-x-2",
            pathname === "/subscription" && "bg-accent text-accent-foreground",
          )}
          variant="ghost"
          size="lg"
          asChild
        >
          <Link href="/subscription" onClick={onLinkClick}>
            <CreditCard className="size-4" />
            Subscription
          </Link>
        </Button>
      </div>

      {/* Bottom: user info + sign out */}
      <Separator />
      <div className="p-4 space-y-2">
        {user && (
          <div className="flex items-center gap-x-3 px-2 py-1">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground uppercase">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        )}

        {user?.role === "ADMIN" && (
          <Link
            href="/admin"
            onClick={onLinkClick}
            className="flex items-center justify-between rounded-md border border-dashed border-neutral-300 px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <span className="flex items-center gap-x-1.5">
              <LayoutDashboard className="size-3.5" />
              Switch to Admin
            </span>
            <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-500">
              Admin
            </span>
          </Link>
        )}

        <Button
          className="w-full justify-start gap-x-2 text-muted-foreground"
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
