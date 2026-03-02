"use client";

import {
  Button,
  Sheet,
  SheetContent,
  SheetTitle,
  VisuallyHidden,
} from "@nestdrive/ui";
import { Menu } from "lucide-react";
import { Logo } from "~/components/logo";
import { type PropsWithChildren, useState } from "react";
import { SidebarContent } from "~/components/dashboard/sidebar";

export function DashboardLayout({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-dvh w-full bg-neutral-50">
      {/* Desktop Sidebar */}
      <div className="hidden h-full w-64 shrink-0 border-r bg-white md:block">
        <SidebarContent />
      </div>

      {/* Mobile Navbar */}
      <div className="fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between border-b bg-white px-4 md:hidden">
        <Logo />
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <Button variant="outline" size="icon" onClick={() => setIsOpen(true)}>
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </Button>
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

      {/* Main Content */}
      <div className="flex h-full min-w-0 flex-1 flex-col pt-16 md:pt-0">
        {children}
      </div>
    </div>
  );
}
