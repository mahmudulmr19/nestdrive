"use client";

import {
  Button,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  VisuallyHidden,
  cn,
} from "@nestdrive/ui";
import { Menu, Package, LayoutDashboard } from "lucide-react";
import { Logo } from "~/components/logo";
import { usePathname } from "next/navigation";
import { type PropsWithChildren, useState } from "react";
import Link from "next/link";

export const sidebarLinks = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },

  {
    label: "Packages",
    href: "/admin/packages",
    icon: Package,
  },
];

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-col p-4 px-8">
        <Logo />
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto p-4">
        {sidebarLinks.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Button
              key={label}
              className={cn("justify-start gap-x-2", isActive && "bg-accent")}
              variant="ghost"
              size="lg"
              asChild
            >
              <Link href={href} onClick={onLinkClick}>
                <Icon className="size-4" />
                {label}
              </Link>
            </Button>
          );
        })}
      </div>

      <div className="w-full border-t p-4">{/* user menu */}</div>
    </div>
  );
}

export function AdminLayout({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-dvh w-full">
      {/* Desktop Sidebar */}
      <div className="hidden h-full w-64 bg-white md:block">
        <SidebarContent />
      </div>

      {/* Mobile Navbar */}
      <div className="fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between border-b bg-white px-4 md:hidden">
        <Logo />
        <div className="flex min-w-0 flex-1 items-center justify-end gap-x-3">
          {/* user menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <VisuallyHidden>
                <SheetTitle>Menu</SheetTitle>
              </VisuallyHidden>
              <div className="h-full w-full bg-white">
                <SidebarContent onLinkClick={() => setIsOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-full w-full flex-1 pt-16 md:pt-0">{children}</div>
    </div>
  );
}
