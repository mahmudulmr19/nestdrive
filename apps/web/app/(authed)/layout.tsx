"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "~/lib/auth";

function AuthCheckingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2">
        <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
        <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
        <span className="size-2 animate-bounce rounded-full bg-primary" />
      </div>
    </div>
  );
}

export default function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, pathname, router, user]);

  if (isLoading) {
    return <AuthCheckingScreen />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
