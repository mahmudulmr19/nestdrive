"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, router, user]);

  if (isLoading) {
    return <AuthCheckingScreen />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
